import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { DrizzleModule } from '../drizzle/drizzle.module';

/**
 * Module for everything related to customer data.
 * TODO: move entities that were just put here for simplicity of benchmarking to the right package
 */
@Module({
  // TODO check how DrizzleModule dependency could be removed
  //  (currently it can't because the customerController needs
  //  the concrete implementation of the customerRepository)
  imports: [LoggerModule, DrizzleModule],
  providers: [],
  exports: [],
  controllers: [],
})
export class BenchmarkDataModule {}
