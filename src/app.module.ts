import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { BenchmarkMetricsModule } from './benchmark-metrics/benchmark-metrics.module';
import { MockCreatorModule } from './mock-creator/mock-creator.module';
import { BenchmarkRunnerModule } from './benchmark-runner/benchmark-runner.module';
import { BenchmarkDataModule } from './benchmark-data/benchmark-data.module';

@Module({
  imports: [
    LoggerModule,
    BenchmarkDataModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    DrizzleModule,
    BenchmarkMetricsModule,
    MockCreatorModule,
    BenchmarkRunnerModule,
  ],
})
export class AppModule {}
