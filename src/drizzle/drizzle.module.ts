import { Module } from '@nestjs/common';
import { drizzleProvider } from './drizzle.provider';
import { BenchmarkMetricsModule } from '../benchmark-metrics/benchmark-metrics.module';
import { CustomerDrizzleRepository } from './repository/customer/customer.drizzle.repository';
import { OrderDrizzleRepository } from './repository/orders/order.drizzle.repository';
import { LoggerModule } from '../logger/logger.module';
import { BillsDrizzleRepository } from './repository/bills/bills.drizzle.repository';

/**
 * Module for the drizzle ORM. Contains the providers for the drizzle ORM and
 * the repository implementations of the interfaces defined in the domain modules
 */
@Module({
  imports: [BenchmarkMetricsModule, LoggerModule],
  // TODO: taken from tutorial, must this be an array with spread? look into this
  providers: [
    ...drizzleProvider,
    CustomerDrizzleRepository,
    OrderDrizzleRepository,
    BillsDrizzleRepository,
  ],
  exports: [
    ...drizzleProvider,
    CustomerDrizzleRepository,
    OrderDrizzleRepository,
    BillsDrizzleRepository,
  ],
})
export class DrizzleModule {}
