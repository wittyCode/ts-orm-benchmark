import { Inject, Injectable } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BenchmarkMetricsService } from '../../benchmark-metrics/service/benchmark-metrics.service';
import { benchmark } from '../../benchmark-metrics/util/benchmark.helper';
import * as billSchema from '../schema/bills';
import { BillEntity } from '../../benchmark-data/model/bill.entity';
import { BillsRepository } from '../../benchmark-data/repository/bills.repository';

@Injectable()
export class DrizzleBillsRepository implements BillsRepository {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly drizzle: NodePgDatabase<typeof billSchema>,
    private readonly benchmarkMetricsService: BenchmarkMetricsService,
  ) {}

  async insertManyBills(bills: BillEntity[]): Promise<void> {
    // WARNING: there seems to be an issue with big transaction sizes / many inserts, for 10_000 records it just breaks with
    // bind message has 4464 parameters but 0 parameters or something like that
    // or with "Maximum call stack size exceeded" error
    // TODO: think if this can be parallelized with Promise.all -> but maybe that's not in scope of this benchmark since this would be an optimization
    const chunkSize = 1000;
    const expectedChunks = Math.ceil(bills.length / chunkSize);
    for (let i = 0; i < bills.length; i += chunkSize) {
      const chunk = bills.slice(i, i + chunkSize);
      await benchmark(
        'DRIZZLE: insert bill chunks',
        this.insertManyChunks.bind(this),
        this.benchmarkMetricsService.resultMap,
        chunk,
      );
      console.log(`chunk ${i / chunkSize + 1} of ${expectedChunks} done!`);
    }
  }

  private async insertManyChunks(bills: BillEntity[]): Promise<void> {
    await this.drizzle.insert(billSchema.bills).values(bills).execute();
  }

  async findAll(): Promise<BillEntity[]> {
    return this.drizzle.query.bills.findMany() as unknown as Promise<
      BillEntity[]
    >;
  }

  async drop(): Promise<void> {
    await this.drizzle.delete(billSchema.bills).execute();
  }
}
