import { Injectable } from '@nestjs/common';
import { BenchmarkMetricsService } from '../../benchmark-metrics/service/benchmark-metrics.service';
import { CustomerDrizzleRepository } from '../../drizzle/repository/customer/customer.drizzle.repository';
import { OrderDrizzleRepository } from '../../drizzle/repository/orders/order.drizzle.repository';
import { BillsDrizzleRepository } from '../../drizzle/repository/bills/bills.drizzle.repository';
import { MarketingCampaignsDrizzleRepository } from '../../drizzle/repository/marketing-campaigns/marketing-campaigns.drizzle.repository';
import { LoggerService } from '../../logger/logger.service';
import { CreateMockService } from '../../mock-creator/service/create-mock.service';
import { benchmark } from '../../benchmark-metrics/util/benchmark.helper';
import { ConfigService } from '@nestjs/config';

export const marketingCampaignDivisorKey = 'MARKETING_CAMPAIGN_DIVISOR';

@Injectable()
export class DrizzleWriteBenchmarkService {
  constructor(
    private readonly createMockService: CreateMockService,
    private readonly benchmarkService: BenchmarkMetricsService,
    private readonly customerDrizzleRepository: CustomerDrizzleRepository,
    private readonly orderDrizzleRepository: OrderDrizzleRepository,
    private readonly billDrizzleRepository: BillsDrizzleRepository,
    private readonly marketingCampaignsDrizzleRepository: MarketingCampaignsDrizzleRepository,
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  async resetBenchmark(): Promise<void> {
    this.loggerService.log('Resetting benchmark');
    // FK cascading deletes will delete addresses, orders as well
    await this.customerDrizzleRepository.drop();
    await this.billDrizzleRepository.drop();
    await this.marketingCampaignsDrizzleRepository.drop();
    this.benchmarkService.resultMap.clear();
  }

  async runWriteBenchmark(customerSize: number) {
    const startTime = performance.now();
    this.loggerService.log(
      `Benchmark for inserts started with size ${customerSize}`,
    );
    // 1. create fake entities (do that in the beginning or do it for each entity? => probably for each, due to large sizes of later entities)
    this.loggerService.log(`Creating ${customerSize} fake customers`);
    const customerEntities =
      await this.createMockService.createMockCustomers(customerSize);

    const ordersFlat = customerEntities.map((entity) => entity.orders).flat();
    const orderCount = ordersFlat.length;

    const orderedPartsFlatCount = ordersFlat
      .map((entity) => entity.orderedParts)
      .flat().length;

    const billSize = customerSize;
    this.loggerService.log(`Creating ${billSize} fake bills`);
    const billEntities = await this.createMockService.createMockBills(
      billSize,
      customerEntities.map((it) => it.id),
    );

    const marketingCampaignDivisor =
      parseInt(this.configService.get<string>(marketingCampaignDivisorKey)) ||
      100;
    const marketingCampaignCount = Math.ceil(
      customerSize / marketingCampaignDivisor,
    );
    this.loggerService.log(
      `Creating ${marketingCampaignCount} fake marketing campaigns`,
    );
    const marketingCampaignEntities =
      await this.createMockService.createMockMarketingCampaigns(
        marketingCampaignCount,
      );

    const sumOfAll =
      customerEntities.length +
      orderCount +
      orderedPartsFlatCount +
      billEntities.length +
      marketingCampaignCount;

    this.loggerService.log(
      `
      Creation of test data set with size ${customerSize} successful:
      ${customerEntities.length} customer entities created!
      ${orderCount} order entities created!
      ${orderedPartsFlatCount} ordered part data entries created!
      ${billEntities.length} bill entities created!
      ${marketingCampaignCount} marketing campaign entities created!
      `,
    );

    // 2. insert customers with address, orders
    this.loggerService.log('Inserting customers');
    await benchmark(
      'insertAllCustomers',
      this.customerDrizzleRepository.upsertManyCustomers.bind(
        this.customerDrizzleRepository,
      ),
      this.benchmarkService.resultMap,
      customerEntities,
    );

    // 3. insert orders with orderedParts
    this.loggerService.log('Inserting orders');
    await benchmark(
      'insertAllOrders',
      this.orderDrizzleRepository.upsertManyOrdersFromCustomersAsChunks.bind(
        this.orderDrizzleRepository,
      ),
      this.benchmarkService.resultMap,
      customerEntities,
    );

    // 4. insert bills
    this.loggerService.log('Inserting bills');
    await benchmark(
      'insertAllBills',
      this.billDrizzleRepository.upsertManyBills.bind(
        this.billDrizzleRepository,
      ),
      this.benchmarkService.resultMap,
      billEntities,
    );

    // 4a. update ordered parts data entries with relation to billIds
    this.loggerService.log('Updating ordered part data entries with billId');
    const orderedParts = ordersFlat.map((entity) => entity.orderedParts).flat();
    await benchmark(
      'updateOrderedPartsWithBillIds',
      this.orderDrizzleRepository.updateOrderedPartWithBillId.bind(
        this.orderDrizzleRepository,
      ),
      this.benchmarkService.resultMap,
      orderedParts,
      billEntities,
    );

    // 5. insert marketing campaigns
    this.loggerService.log('Inserting marketing campaigns');
    await benchmark(
      'insertAllMarketingCampaigns',
      this.marketingCampaignsDrizzleRepository.upsertManyMarketingCampaigns.bind(
        this.marketingCampaignsDrizzleRepository,
      ),
      this.benchmarkService.resultMap,
      marketingCampaignEntities,
    );

    // 6. insert jointable marketing campaing <-> customers

    const duration = performance.now() - startTime;
    return [duration, sumOfAll];
  }
}
