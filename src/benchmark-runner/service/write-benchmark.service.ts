import { Injectable } from '@nestjs/common';
import { BenchmarkMetricsService } from '../../benchmark-metrics/service/benchmark-metrics.service';
import { LoggerService } from '../../logger/logger.service';
import { CreateMockService } from '../../mock-creator/service/create-mock.service';
import { benchmark } from '../../benchmark-metrics/util/benchmark.helper';
import { ConfigService } from '@nestjs/config';
import { BenchmarkInputRepositoryDelegate } from '../../benchmark-data/repository/benchmark-input-repository-delegate';

export const marketingCampaignDivisorKey = 'MARKETING_CAMPAIGN_DIVISOR';
export const customersPerCampaignKey = 'MARKETING_CAMPAINGS_TO_CUSTOMER_FACTOR';

@Injectable()
export class WriteBenchmarkService {
  constructor(
    private readonly createMockService: CreateMockService,
    private readonly benchmarkService: BenchmarkMetricsService,
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  async resetBenchmark(
    repositories: BenchmarkInputRepositoryDelegate,
  ): Promise<void> {
    this.loggerService.log('Resetting benchmark');
    await repositories.marketingCampaignsRepository.drop();
    // FK cascading deletes will delete addresses, orders as well
    await repositories.customerRepository.drop();
    await repositories.billsRepository.drop();
    this.benchmarkService.resultMap.clear();
  }

  async runWriteBenchmark(
    repositories: BenchmarkInputRepositoryDelegate,
    customerSize: number,
  ) {
    const startTime = performance.now();
    this.loggerService.log(
      `Benchmark for inserts started with size ${customerSize}`,
    );
    // TODO: move step 1 to service, e.g. BenchmarkDataInstantiatorService
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

    const customersPerCampaign =
      parseInt(this.configService.get<string>(customersPerCampaignKey)) || 10;
    this.loggerService.log(
      `Creating joinTable entries for marketing campaigns with up to ${customersPerCampaign} customers per campaign`,
    );
    const customersPerCampaignEntities =
      await this.createMockService.createRandomlyLinkedCampaignsToCustomers(
        marketingCampaignEntities,
        customerEntities,
        customersPerCampaign,
      );

    const sumOfAll =
      customerEntities.length +
      orderCount +
      orderedPartsFlatCount +
      billEntities.length +
      marketingCampaignCount +
      customersPerCampaignEntities.length;

    this.loggerService.log(
      `
      Creation of test data set with size ${customerSize} successful:
      ${customerEntities.length} customer entities created!
      ${orderCount} order entities created!
      ${orderedPartsFlatCount} ordered part data entries created!
      ${billEntities.length} bill entities created!
      ${marketingCampaignCount} marketing campaign entities created!
      ${customersPerCampaignEntities.length} joinTable entities between customers and marketingCampaigns created!
      `,
    );

    // 2. insert customers with address, orders
    this.loggerService.log('Inserting customers');
    await benchmark(
      'insertAllCustomers',
      repositories.customerRepository.upsertManyCustomers.bind(
        repositories.customerRepository,
      ),
      this.benchmarkService.resultMap,
      customerEntities,
    );

    // 3. insert orders with orderedParts
    this.loggerService.log('Inserting orders');
    await benchmark(
      'insertAllOrders',
      repositories.ordersRepository.upsertManyOrdersFromCustomersAsChunks.bind(
        repositories.ordersRepository,
      ),
      this.benchmarkService.resultMap,
      customerEntities,
    );

    // 4. insert bills
    this.loggerService.log('Inserting bills');
    await benchmark(
      'insertAllBills',
      repositories.billsRepository.upsertManyBills.bind(
        repositories.billsRepository,
      ),
      this.benchmarkService.resultMap,
      billEntities,
    );

    // 4a. update ordered parts data entries with relation to billIds
    this.loggerService.log('Updating ordered part data entries with billId');
    const orderedParts = ordersFlat.map((entity) => entity.orderedParts).flat();
    await benchmark(
      'updateOrderedPartsWithBillIds',
      repositories.ordersRepository.updateOrderedPartWithBillId.bind(
        repositories.ordersRepository,
      ),
      this.benchmarkService.resultMap,
      orderedParts,
      billEntities,
    );

    // 5. insert marketing campaigns
    this.loggerService.log('Inserting marketing campaigns');
    await benchmark(
      'insertAllMarketingCampaigns',
      repositories.marketingCampaignsRepository.upsertManyMarketingCampaigns.bind(
        repositories.marketingCampaignsRepository,
      ),
      this.benchmarkService.resultMap,
      marketingCampaignEntities,
    );

    // 6. insert jointable marketing campaing <-> customers
    this.loggerService.log(
      'Inserting joinTable entries for marketing campaigns to customers',
    );
    await benchmark(
      'insertAllJoinTableEntries',
      repositories.marketingCampaignsRepository.linkMarketingCampaignsToCustomers.bind(
        repositories.marketingCampaignsRepository,
      ),
      this.benchmarkService.resultMap,
      customersPerCampaignEntities,
    );

    const duration = performance.now() - startTime;
    return [duration, sumOfAll];
  }
}
