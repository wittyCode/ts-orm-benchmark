import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';
import { DrizzleWriteBenchmarkService } from './drizzle.write-benchmark.service';
import { BenchmarkRepositoryFactoryService } from './benchmark-repository-factory.service';
import { ReadBenchmarkService } from './read-benchmark.service';

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
    private readonly drizzleWriteBenchmarkService: DrizzleWriteBenchmarkService,
    private readonly benchmarkRepositoryFactoryService: BenchmarkRepositoryFactoryService,
    private readonly loggerService: LoggerService,
  ) {}

  // TODO: make db driver param and use correct repo for reset
  async resetBenchmark(): Promise<void> {
    this.loggerService.log('Resetting benchmark');
    this.drizzleWriteBenchmarkService.resetBenchmark();
  }

  /*
    have separate benchmarks for inserts and different types or reads/reports
   */
  async runInsertBenchmark(
    dbDriver: BenchmarkType,
    customerSize: number,
  ): Promise<number> {
    this.loggerService.log(`Benchmark for ${dbDriver} started!`);

    let duration = -1;
    let sumOfAll = -1;

    if (dbDriver === BenchmarkType.DRIZZLE) {
      [duration, sumOfAll] =
        await this.drizzleWriteBenchmarkService.runWriteBenchmark(customerSize);
    } else {
      throw new InternalServerErrorException(
        `Database driver ${dbDriver} currently not supported yet`,
      );
    }

    this.loggerService.log(
      // TODO: conditional pretty printing depending on duration (ms, s, min)
      `Benchmark for ${dbDriver} finished in ${Math.round(
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
    this.loggerService.log(`Benchmark for ${dbDriver} started!`);
    const repositories =
      this.benchmarkRepositoryFactoryService.createRepositoryDelegate(dbDriver);
    const duration =
      await this.readBenchmarkService.runReadBenchmark(repositories);
    this.loggerService.log(
      // TODO: conditional pretty printing depending on duration (ms, s, min)
      `Benchmark for ${dbDriver} finished in ${Math.round(
        duration / 1000,
      )} seconds!`,
    );
    return Math.round(duration);
  }
}
