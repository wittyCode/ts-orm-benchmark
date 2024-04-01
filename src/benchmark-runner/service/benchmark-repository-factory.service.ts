import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BenchmarkType } from './benchmark-orchestrator.service';
import { BenchmarkInputRepositoryDelegate } from '../../benchmark-data/repository/benchmark-input-repository-delegate';
import { DrizzleCustomerRepository } from '../../drizzle/repository/drizzle.customer.repository';
import { DrizzleBillsRepository } from '../../drizzle/repository/drizzle.bills.repository';
import { DrizzleOrderRepository } from '../../drizzle/repository/drizzle.order.repository';
import { DrizzleMarketingCampaignsRepository } from '../../drizzle/repository/drizzle.marketing-campaigns.repository';
import { PrismaCustomerRepository } from '../../prisma/repository/prisma.customer.repository';
import { PrismaBillsRepository } from '../../prisma/repository/prisma.bills.repository';
import { PrismaMarketingCampaignRepository } from '../../prisma/repository/prisma.marketing-campaigns.repository';
import { PrismaOrdersRepository } from '../../prisma/repository/prisma.orders.repository';

@Injectable()
export class BenchmarkRepositoryFactoryService {
  constructor(
    private readonly drizzleCustomerRepository: DrizzleCustomerRepository,
    private readonly drizzleBillsRepository: DrizzleBillsRepository,
    private readonly drizzleOrdersRepository: DrizzleOrderRepository,
    private readonly drizzleMarketingCampaignsRepository: DrizzleMarketingCampaignsRepository,
    private readonly prismaCustomerRepository: PrismaCustomerRepository,
    private readonly prismaBillsRepository: PrismaBillsRepository,
    private readonly prismaMarketingCampaignRepository: PrismaMarketingCampaignRepository,
    private readonly prismaOrdersRepository: PrismaOrdersRepository,
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
    }
    if (benchmarkType === BenchmarkType.PRISMA) {
      return {
        customerRepository: this.prismaCustomerRepository,
        billsRepository: this.prismaBillsRepository,
        ordersRepository: this.prismaOrdersRepository,
        marketingCampaignsRepository: this.prismaMarketingCampaignRepository,
      };
    } else {
      throw new InternalServerErrorException(
        `Database driver ${benchmarkType} currently not supported yet`,
      );
    }
  }
}
