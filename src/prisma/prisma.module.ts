import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { PrismaService } from './prisma.service';
import { PrismaCustomerRepository } from './repository/prisma.customer.repository';
import { PrismaBillsRepository } from './repository/prisma.bills.repository';
import { PrismaOrdersRepository } from './repository/prisma.orders.repository';
import { BenchmarkMetricsModule } from '../benchmark-metrics/benchmark-metrics.module';
import { PrismaMarketingCampaignRepository } from './repository/prisma.marketing-campaigns.repository';

/**
 * Module to encapsulate database access, currently with Prisma ORM
 */
@Module({
  imports: [BenchmarkMetricsModule, LoggerModule],
  providers: [
    PrismaService,
    PrismaCustomerRepository,
    PrismaBillsRepository,
    PrismaMarketingCampaignRepository,
    PrismaOrdersRepository,
  ],
  exports: [
    PrismaService,
    PrismaCustomerRepository,
    PrismaBillsRepository,
    PrismaMarketingCampaignRepository,
    PrismaOrdersRepository,
  ],
})
export class PrismaModule {}
