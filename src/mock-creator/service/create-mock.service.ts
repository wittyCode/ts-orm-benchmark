import { Injectable } from '@nestjs/common';
import { CustomerFakerService } from './customer-faker.service';
import { benchmark } from '@/benchmark-metrics/util/benchmark.helper';
import { CustomerEntity } from '@/benchmark-data/model/customer.entity';
import { LoggerService } from '@/logger/logger.service';
import { BenchmarkMetricsService } from '@/benchmark-metrics/service/benchmark-metrics.service';
import { BillEntity } from '@/benchmark-data/model/bill.entity';
import { BillsFakerService } from './bills-faker.service';
import { MarketingCampaignEntity } from '@/benchmark-data/model/marketing-campaign.entity';
import { MarketingCampaignFakerService } from './marketing-campaign-faker.service';
import { MarketingCampaignToCustomer } from '@/benchmark-data/repository/marketing-campaigns.repository';

@Injectable()
export class CreateMockService {
  constructor(
    private readonly customerFakerService: CustomerFakerService,
    private readonly billFakerService: BillsFakerService,
    private readonly marketingCampaignFakerService: MarketingCampaignFakerService,
    private readonly loggerService: LoggerService,
    private readonly benchmarkService: BenchmarkMetricsService,
  ) {}

  async createRandomlyLinkedCampaignsToCustomers(
    marketingCampaigns: MarketingCampaignEntity[],
    customers: CustomerEntity[],
    maxAmount: number,
  ): Promise<MarketingCampaignToCustomer[]> {
    const entities = await benchmark<MarketingCampaignToCustomer[]>(
      `Create relations between marketing Campaigns and customers`,
      this.marketingCampaignFakerService.createRandomlyLinkedCampaignsToCustomers.bind(
        this.marketingCampaignFakerService,
      ),
      this.benchmarkService.resultMap,
      marketingCampaigns,
      customers,
      maxAmount,
    );
    this.loggerService.log(
      `${entities.length} join talbe entries for campaigns to customers created`,
    );
    return entities;
  }

  async createMockMarketingCampaigns(amount: number) {
    const entities = await benchmark<MarketingCampaignEntity[]>(
      `Create ${amount} mock campaign entities`,
      this.marketingCampaignFakerService.createMockMarketingCampaigns.bind(
        this.marketingCampaignFakerService,
      ),
      this.benchmarkService.resultMap,
      amount,
    );
    this.loggerService.log(
      `${entities.length} mock marketing campaign entities created`,
    );
    return entities;
  }

  async createMockBills(amount: number, customerIds: string[]) {
    const entities = await benchmark<BillEntity[]>(
      `Create ${amount} mock bills`,
      this.billFakerService.createMockEntities.bind(this.billFakerService),
      this.benchmarkService.resultMap,
      amount,
      customerIds,
    );
    this.loggerService.log(`${entities.length} mock bill entities created`);
    return entities;
  }

  async createMockCustomers(amount: number) {
    this.loggerService.log(
      `Mock creation process for ${amount} customers started`,
    );

    const entities = await benchmark<CustomerEntity[]>(
      `Create ${amount} mock customers`,
      this.customerFakerService.createMockEntities.bind(
        this.customerFakerService,
      ),
      this.benchmarkService.resultMap,
      amount,
    );
    this.loggerService.log(`${entities.length} mock customer entities created`);
    return entities;
  }
}
