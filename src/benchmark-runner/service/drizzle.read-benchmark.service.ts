import { Injectable } from '@nestjs/common';
import { BillEntity } from '../../benchmark-data/model/bill.entity';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';
import { MarketingCampaignEntity } from '../../benchmark-data/model/marketing-campaign.entity';
import { OrderEntity } from '../../benchmark-data/model/order.entity';
import { benchmark } from '../../benchmark-metrics/util/benchmark.helper';
import { BenchmarkMetricsService } from '../../benchmark-metrics/service/benchmark-metrics.service';
import { CustomerDrizzleRepository } from '../../drizzle/repository/customer/customer.drizzle.repository';
import { OrderDrizzleRepository } from '../../drizzle/repository/orders/order.drizzle.repository';
import { BillsDrizzleRepository } from '../../drizzle/repository/bills/bills.drizzle.repository';
import { MarketingCampaignsDrizzleRepository } from '../../drizzle/repository/marketing-campaigns/marketing-campaigns.drizzle.repository';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class DrizzleReadBenchmarkService {
  constructor(
    private readonly benchmarkService: BenchmarkMetricsService,
    private readonly customerDrizzleRepository: CustomerDrizzleRepository,
    private readonly orderDrizzleRepository: OrderDrizzleRepository,
    private readonly billDrizzleRepository: BillsDrizzleRepository,
    private readonly marketingCampaignsDrizzleRepository: MarketingCampaignsDrizzleRepository,
    private readonly loggerService: LoggerService,
  ) {}

  async runReadBenchmark() {
    const startTime = performance.now();
    //this.loggerService.log(
    //  `Benchmark for reads started with size ${customerSize}`,
    //);

    // 1. find all customers
    this.loggerService.log('Reading customers');
    const customers = await benchmark<CustomerEntity[]>(
      'findAllCustomers',
      this.customerDrizzleRepository.findAll.bind(
        this.customerDrizzleRepository,
      ),
      this.benchmarkService.resultMap,
    );
    this.loggerService.log(`Found ${customers.length} customers`);

    // 3. find all orders with ordered parts
    this.loggerService.log('Reading orders');
    const orders = await benchmark<OrderEntity[]>(
      'findAllOrders',
      this.orderDrizzleRepository.findAll.bind(this.orderDrizzleRepository),
      this.benchmarkService.resultMap,
    );
    this.loggerService.log(`Found ${orders.length} orders`);

    // 4. find all bills
    this.loggerService.log('Reading bills');
    const bills = await benchmark<BillEntity[]>(
      'findAllBills',
      this.billDrizzleRepository.findAll.bind(this.billDrizzleRepository),
      this.benchmarkService.resultMap,
    );
    this.loggerService.log(`Found ${bills.length} bills`);

    // 5. find all marketing campaigns
    this.loggerService.log('Reading marketing campaigns');
    const marketingCampaigns = await benchmark<MarketingCampaignEntity[]>(
      'findAllMarketingCampaigns',
      this.marketingCampaignsDrizzleRepository.findAll.bind(
        this.marketingCampaignsDrizzleRepository,
      ),
      this.benchmarkService.resultMap,
    );
    this.loggerService.log(
      `Found ${marketingCampaigns.length} marketing campaigns`,
    );

    const duration = performance.now() - startTime;
    return duration;
  }
}
