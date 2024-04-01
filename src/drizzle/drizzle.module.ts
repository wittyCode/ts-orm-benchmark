import { Module } from '@nestjs/common';
import { drizzleProvider } from './drizzle.provider';
import { BenchmarkMetricsModule } from '../benchmark-metrics/benchmark-metrics.module';
import { LoggerModule } from '../logger/logger.module';
import { DrizzleCustomerRepository } from './repository/drizzle.customer.repository';
import { DrizzleOrderRepository } from './repository/drizzle.order.repository';
import { DrizzleBillsRepository } from './repository/drizzle.bills.repository';
import { DrizzleMarketingCampaignsRepository } from './repository/drizzle.marketing-campaigns.repository';

/**
 * Module for the drizzle ORM. Contains the providers for the drizzle ORM and
 * the repository implementations of the interfaces defined in the domain modules
 */
@Module({
  imports: [BenchmarkMetricsModule, LoggerModule],
  // TODO: taken from tutorial, must this be an array with spread? look into this
  providers: [
    ...drizzleProvider,
    DrizzleCustomerRepository,
    DrizzleOrderRepository,
    DrizzleBillsRepository,
    DrizzleMarketingCampaignsRepository,
  ],
  exports: [
    ...drizzleProvider,
    DrizzleCustomerRepository,
    DrizzleOrderRepository,
    DrizzleBillsRepository,
    DrizzleMarketingCampaignsRepository,
  ],
})
export class DrizzleModule {}
