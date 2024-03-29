import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';
import { BenchmarkRepositoryFactoryService } from './benchmark-repository-factory.service';
import { ReadBenchmarkService } from './read-benchmark.service';
import { WriteBenchmarkService } from './write-benchmark.service';

export enum BenchmarkType {
  DRIZZLE = 'drizzle',
  TYPEORM = 'typeorm',
  PRISMA = 'prisma',
  MIKRO_ORM = 'mikro-orm',
  KNEX = 'knex',
  KYSELY = 'kysely',
  OBJECTIONJS = 'objectionjs',
  SEQUELIZE = 'sequelize',
}

@Injectable()
export class BenchmarkOrchestratorService {
  constructor(
    private readonly readBenchmarkService: ReadBenchmarkService,
    private readonly drizzleWriteBenchmarkService: WriteBenchmarkService,
    private readonly benchmarkRepositoryFactoryService: BenchmarkRepositoryFactoryService,
    private readonly loggerService: LoggerService,
  ) {}

  // TODO: make db driver param and use correct repo for reset
  async resetBenchmark(dbDriver: BenchmarkType): Promise<void> {
    this.loggerService.log('Resetting benchmark');
    const repositories =
      this.benchmarkRepositoryFactoryService.createRepositoryDelegate(dbDriver);
    this.drizzleWriteBenchmarkService.resetBenchmark(repositories);
  }

  /*
    we have separate benchmarks for inserts and different types or reads/reports
   */
  async runWriteBenchmark(
    dbDriver: BenchmarkType,
    customerSize: number,
  ): Promise<number> {
    this.loggerService.log(`Benchmark for ${dbDriver} started!`);

    const repositories =
      this.benchmarkRepositoryFactoryService.createRepositoryDelegate(dbDriver);
    const [duration, sumOfAll] =
      await this.drizzleWriteBenchmarkService.runWriteBenchmark(
        repositories,
        customerSize,
      );

    this.loggerService.log(
      // TODO: conditional pretty printing depending on duration (ms, s, min)
      `benchmark for ${dbDriver} finished in ${Math.round(
        duration / 1000,
      )} seconds!,
      ${sumOfAll} entities created overall!`,
    );
    return Math.round(duration);
  }

  async runReadBenchmark(
    dbdriver: BenchmarkType,
    // TODO: make read batchsize part of this
    //customersize: number,
  ): Promise<number> {
    this.loggerService.log(`benchmark for ${dbdriver} started!`);
    const repositories =
      this.benchmarkRepositoryFactoryService.createRepositoryDelegate(dbdriver);
    const duration =
      await this.readBenchmarkService.runReadBenchmark(repositories);
    this.loggerService.log(
      // TODO: conditional pretty printing depending on duration (ms, s, min)
      `benchmark for ${dbdriver} finished in ${Math.round(
        duration / 1000,
      )} seconds!`,
    );
    return Math.round(duration);
  }
}
