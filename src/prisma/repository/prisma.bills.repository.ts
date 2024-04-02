import { Injectable } from '@nestjs/common';
import { BillsRepository } from '../../benchmark-data/repository/bills.repository';
import { BillEntity } from '../../benchmark-data/model/bill.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaBillsRepository implements BillsRepository {

  constructor(
    private readonly prismaService: PrismaService,
  ) { }

  async upsertManyBills(bills: BillEntity[]): Promise<void> { }

  async findAll(): Promise<BillEntity[]> {
    const result = await this.prismaService.bills.findMany({});
    return result as BillEntity[];
  }

  async drop(): Promise<void> {
    await this.prismaService.bills.deleteMany({});
  }
}
