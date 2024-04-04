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
    private readonly writeBenchmarkService: WriteBenchmarkService,
    private readonly benchmarkRepositoryFactoryService: BenchmarkRepositoryFactoryService,
    private readonly loggerService: LoggerService,
  ) {}

  async resetBenchmark(dbDriver: BenchmarkType): Promise<void> {
    this.loggerService.log('Resetting benchmark');
    const repositories =
      this.benchmarkRepositoryFactoryService.createRepositoryDelegate(dbDriver);
    this.writeBenchmarkService.resetBenchmark(repositories);
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
      await this.writeBenchmarkService.runWriteBenchmark(
        repositories,
        customerSize,
        dbDriver,
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
    dbDriver: BenchmarkType,
    // TODO: make read batchsize part of this
    //customerSize: number,
  ): Promise<number> {
    this.loggerService.log(`benchmark for ${dbDriver} started!`);
    const repositories =
      this.benchmarkRepositoryFactoryService.createRepositoryDelegate(dbDriver);
    const duration = await this.readBenchmarkService.runReadBenchmark(
      repositories,
      dbDriver,
    );
    this.loggerService.log(
      // TODO: conditional pretty printing depending on duration (ms, s, min)
      `benchmark for ${dbDriver} finished in ${Math.round(
        duration / 1000,
      )} seconds!`,
    );
    return Math.round(duration);
  }
}
