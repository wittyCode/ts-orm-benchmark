import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BenchmarkType } from './benchmark-orchestrator.service';
import { BenchmarkInputRepositoryDelegate } from '../../benchmark-data/repository/benchmark-input-repository-delegate';
import { DrizzleBillsRepository } from '../../drizzle/repository/bills/drizzle.bills.repository';
import { DrizzleOrderRepository } from '../../drizzle/repository/orders/drizzle.order.repository';
import { DrizzleMarketingCampaignsRepository } from '../../drizzle/repository/marketing-campaigns/drizzle.marketing-campaigns.repository';
import { DrizzleCustomerRepository } from '../../drizzle/repository/customer/drizzle.customer.repository';

@Injectable()
export class BenchmarkRepositoryFactoryService {
  constructor(
    private readonly drizzleCustomerRepository: DrizzleCustomerRepository,
    private readonly drizzleBillsRepository: DrizzleBillsRepository,
    private readonly drizzleOrdersRepository: DrizzleOrderRepository,
    private readonly drizzleMarketingCampaignsRepository: DrizzleMarketingCampaignsRepository,
  ) {}

  createRepositoryDelegate(
    benchmarkType: BenchmarkType,
  ): BenchmarkInputRepositoryDelegate {
    if (benchmarkType === BenchmarkType.DRIZZLE) {
      return {
        customerRepository: this.drizzleCustomerRepository,
        billsRepository: this.drizzleBillsRepository,
        ordersRepository: this.drizzleOrdersRepository,
        marketingCampaignsRepository: this.drizzleMarketingCampaignsRepository,
      };
    } else {
      throw new InternalServerErrorException(
        `Database driver ${benchmarkType} currently not supported yet`,
      );
    }
  }
}
