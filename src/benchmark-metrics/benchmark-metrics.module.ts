import { Module } from '@nestjs/common';
import { BenchmarkMetricsService } from './service/benchmark-metrics.service';
import { BenchmarkMetricsController } from './controller/benchmark-metrics.controller';
import { LoggerModule } from '../logger/logger.module';

/**
 * Module for benchmarking: contains utiltity function for measuring function duration
 * and a service that stores the results of the benchmarks to make them accessible later
 */
@Module({
  imports: [LoggerModule],
  providers: [BenchmarkMetricsService],
  exports: [BenchmarkMetricsService],
  controllers: [BenchmarkMetricsController],
})
export class BenchmarkMetricsModule {}
