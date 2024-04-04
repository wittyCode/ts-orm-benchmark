import { Injectable } from '@nestjs/common';
import { BillsRepository } from '../../benchmark-data/repository/bills.repository';
import { BillEntity } from '../../benchmark-data/model/bill.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaBillsRepository implements BillsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async upsertManyBills(bills: BillEntity[]): Promise<void> {}

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
