import { Injectable } from '@nestjs/common';
import { BillEntity } from '../../benchmark-data/model/bill.entity';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';
import { MarketingCampaignEntity } from '../../benchmark-data/model/marketing-campaign.entity';
import { OrderEntity } from '../../benchmark-data/model/order.entity';
import { benchmark } from '../../benchmark-metrics/util/benchmark.helper';
import { BenchmarkMetricsService } from '../../benchmark-metrics/service/benchmark-metrics.service';
import { LoggerService } from '../../logger/logger.service';
import { BenchmarkInputRepositoryDelegate } from '../../benchmark-data/repository/benchmark-input-repository-delegate';
import { BenchmarkType } from './benchmark-orchestrator.service';

@Injectable()
export class ReadBenchmarkService {
  constructor(
    private readonly benchmarkService: BenchmarkMetricsService,
    private readonly loggerService: LoggerService,
  ) {}

  async runReadBenchmark(
    repositories: BenchmarkInputRepositoryDelegate,
    benchmarkType: BenchmarkType,
  ) {
    const startTime = performance.now();
    //this.loggerService.log(
    //  `Benchmark for reads started with size ${customerSize}`,
    //);

    // 1. find all customers
    this.loggerService.log('Reading customers');
    const customers = await benchmark<CustomerEntity[]>(
      `${benchmarkType} findAllCustomers`,
      repositories.customerRepository.findAll.bind(
        repositories.customerRepository,
      ),
      this.benchmarkService.resultMap,
    );

    // 2. find all orders with ordered parts
    this.loggerService.log('Reading orders');
    const orders = await benchmark<OrderEntity[]>(
      `${benchmarkType} findAllOrders`,
      repositories.ordersRepository.findAll.bind(repositories.ordersRepository),
      this.benchmarkService.resultMap,
    );

    // 3. find all bills
    this.loggerService.log('Reading bills');
    const bills = await benchmark<BillEntity[]>(
      `${benchmarkType} findAllBills`,
      repositories.billsRepository.findAll.bind(repositories.billsRepository),
      this.benchmarkService.resultMap,
    );

    // 4. find all marketing campaigns
    this.loggerService.log('Reading marketing campaigns');
    const marketingCampaigns = await benchmark<MarketingCampaignEntity[]>(
      `${benchmarkType} findAllMarketingCampaigns`,
      repositories.marketingCampaignsRepository.findAll.bind(
        repositories.marketingCampaignsRepository,
      ),
      this.benchmarkService.resultMap,
    );

    // 5. reporting query: find all customerAddresses in a marketingCampaign
    this.loggerService.log('Reading reports for marketing campaigns');
    const reports = await benchmark<any[]>(
      `${benchmarkType} reportingMarketingCampaigns`,
      repositories.marketingCampaignsRepository.findAddressesInCampaigns.bind(
        repositories.marketingCampaignsRepository,
      ),
      this.benchmarkService.resultMap,
    );

    // 6. log results statistics
    this.loggerService.log(`Found ${customers.length} customers`);
    //console.log(JSON.stringify(customers[0]));
    this.loggerService.log(`Found ${orders.length} orders`);
    //console.log(JSON.stringify(orders[0]));
    this.loggerService.log(`Found ${bills.length} bills`);
    //console.log(JSON.stringify(bills[0]));
    this.loggerService.log(
      `Found ${marketingCampaigns.length} marketing campaigns`,
    );
    //console.log(JSON.stringify(marketingCampaigns[0]));
    this.loggerService.log(
      `Found ${reports.length} reports for marketing campaigns`,
    );
    //console.log(JSON.stringify(reports[0]));

    const duration = performance.now() - startTime;
    return duration;
  }
}
