import { Module } from '@nestjs/common';
import { BenchmarkRunnerController } from './controller/benchmark-runner.controller';
import { BenchmarkOrchestratorService } from './service/benchmark-orchestrator.service';
import { LoggerModule } from '../logger/logger.module';
import { MockCreatorModule } from '../mock-creator/mock-creator.module';
import { BenchmarkMetricsModule } from '../benchmark-metrics/benchmark-metrics.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { BenchmarkDataModule } from '../benchmark-data/benchmark-data.module';
import { DrizzleReadBenchmarkService } from './service/drizzle.read-benchmark.service';
import { DrizzleWriteBenchmarkService } from './service/drizzle.write-benchmark.service';

/**
 * Benchmark runner module with controller that provides endpoints to run specifically configured benchmarks.
 * Used for orchestrating benchmark runs, e.g. by deciding based on config params
 * to see which DB driver to use or how many entities to create.
 */
@Module({
  imports: [
    LoggerModule,
    MockCreatorModule,
    BenchmarkMetricsModule,
    BenchmarkDataModule,
    DrizzleModule,
  ],
  providers: [
    BenchmarkOrchestratorService,
    DrizzleReadBenchmarkService,
    DrizzleWriteBenchmarkService,
  ],
  controllers: [BenchmarkRunnerController],
})
export class BenchmarkRunnerModule {}
