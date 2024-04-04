import { Injectable } from '@nestjs/common';
import { BillEntity } from '../../benchmark-data/model/bill.entity';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';
import { MarketingCampaignEntity } from '../../benchmark-data/model/marketing-campaign.entity';
import { OrderEntity } from '../../benchmark-data/model/order.entity';
import { benchmark } from '../../benchmark-metrics/util/benchmark.helper';
import { BenchmarkMetricsService } from '../../benchmark-metrics/service/benchmark-metrics.service';
import { LoggerService } from '../../logger/logger.service';
import { BenchmarkInputRepositoryDelegate } from '../../benchmark-data/repository/benchmark-input-repository-delegate';

@Injectable()
export class ReadBenchmarkService {
  constructor(
    private readonly benchmarkService: BenchmarkMetricsService,
    private readonly loggerService: LoggerService,
  ) {}

  // TODO : add DB driver to keys for benchmark result map
  async runReadBenchmark(repositories: BenchmarkInputRepositoryDelegate) {
    const startTime = performance.now();
    //this.loggerService.log(
    //  `Benchmark for reads started with size ${customerSize}`,
    //);

    // 1. find all customers
    this.loggerService.log('Reading customers');
    const customers = await benchmark<CustomerEntity[]>(
      `findAllCustomers`,
      repositories.customerRepository.findAll.bind(
        repositories.customerRepository,
      ),
      this.benchmarkService.resultMap,
    );
    this.loggerService.log(`Found ${customers.length} customers`);

    // 3. find all orders with ordered parts
    this.loggerService.log('Reading orders');
    const orders = await benchmark<OrderEntity[]>(
      'findAllOrders',
      repositories.ordersRepository.findAll.bind(repositories.ordersRepository),
      this.benchmarkService.resultMap,
    );
    this.loggerService.log(`Found ${orders.length} orders`);

    // 4. find all bills
    this.loggerService.log('Reading bills');
    const bills = await benchmark<BillEntity[]>(
      'findAllBills',
      repositories.billsRepository.findAll.bind(repositories.billsRepository),
      this.benchmarkService.resultMap,
    );
    this.loggerService.log(`Found ${bills.length} bills`);

    // 5. find all marketing campaigns
    this.loggerService.log('Reading marketing campaigns');
    const marketingCampaigns = await benchmark<MarketingCampaignEntity[]>(
      'findAllMarketingCampaigns',
      repositories.marketingCampaignsRepository.findAll.bind(
        repositories.marketingCampaignsRepository,
      ),
      this.benchmarkService.resultMap,
    );
    this.loggerService.log(
      `Found ${marketingCampaigns.length} marketing campaigns`,
    );

    // 6. reporting query: find all customerAddresses in a marketingCampaign
    this.loggerService.log('Reading reports for marketing campaigns');
    const reports = await benchmark<any[]>(
      'reportingMarketingCampaigns',
      repositories.marketingCampaignsRepository.findAddressesInCampaigns.bind(
        repositories.marketingCampaignsRepository,
      ),
      this.benchmarkService.resultMap,
    );
    this.loggerService.log(
      `Found ${reports.length} reports for marketing campaigns`,
    );

    const duration = performance.now() - startTime;
    return duration;
  }
}
