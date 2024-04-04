import { Injectable } from '@nestjs/common';
import { BillsRepository } from '../../benchmark-data/repository/bills.repository';
import { BillEntity } from '../../benchmark-data/model/bill.entity';
import { PrismaService } from '../prisma.service';
import { benchmark } from '../../benchmark-metrics/util/benchmark.helper';
import { BenchmarkMetricsService } from '../../benchmark-metrics/service/benchmark-metrics.service';

@Injectable()
export class PrismaBillsRepository implements BillsRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly benchmarkMetricsService: BenchmarkMetricsService,
  ) {}

  async upsertManyBills(bills: BillEntity[]): Promise<void> {
    const chunkSize = 1000;
    const expectedChunks = Math.ceil(bills.length / chunkSize);
    for (let i = 0; i < bills.length; i += chunkSize) {
      const chunk = bills.slice(i, i + chunkSize);
      await benchmark(
        'PRISMA: insert bill chunks',
        this.upsertManyChunks.bind(this),
        this.benchmarkMetricsService.resultMap,
        chunk,
      );
      console.log(`chunk ${i / chunkSize + 1} of ${expectedChunks} done!`);
    }
  }

  private async upsertManyChunks(bills: BillEntity[]): Promise<void> {
    await this.prismaService.bills.createMany({
      data: bills,
    });
  }

  async findAll(): Promise<BillEntity[]> {
    const chunkSize = 1000;
    const countInDb = await this.prismaService.bills.count();
    const expectedChunks = Math.ceil(countInDb / chunkSize);
    const result = [];
    for (let i = 0; i <= countInDb; i += chunkSize) {
      console.log(
        `Prisma reading bills chunk ${
          Math.ceil(i / chunkSize) + 1
        } of ${expectedChunks}`,
      );
      result.push(
        await this.prismaService.bills.findMany({
          skip: i,
          take: chunkSize,
        }),
      );
    }

    return result.flat() as BillEntity[];
  }

  async drop(): Promise<void> {
    await this.prismaService.bills.deleteMany({});
  }
}
