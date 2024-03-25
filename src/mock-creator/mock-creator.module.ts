import { Module } from '@nestjs/common';
import { CreateMockService } from './service/create-mock.service';
import { BenchmarkMetricsModule } from '../benchmark-metrics/benchmark-metrics.module';
import { LoggerModule } from '../logger/logger.module';
import { CustomerFakerService } from './service/customer-faker.service';
import { BillsFakerService } from './service/bills-faker.service';
import { OrderFakerService } from './service/order-faker.service';
import { MarketingCampaignFakerService } from './service/marketing-campaign-faker.service';

/**
 * Module for creating mock data for the database benchmarks. Based on faker.js
 */
@Module({
  imports: [BenchmarkMetricsModule, LoggerModule],
  providers: [
    CreateMockService,
    CustomerFakerService,
    BillsFakerService,
    OrderFakerService,
    MarketingCampaignFakerService,
  ],
  exports: [CreateMockService],
})
export class MockCreatorModule {}
