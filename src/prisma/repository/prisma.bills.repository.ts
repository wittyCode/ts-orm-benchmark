import { Injectable } from '@nestjs/common';
import { BillsRepository } from '../../benchmark-data/repository/bills.repository';
import { BillEntity } from '../../benchmark-data/model/bill.entity';

@Injectable()
export class PrismaBillsRepository implements BillsRepository {
  async upsertManyBills(bills: BillEntity[]): Promise<void> {}
  async findAll(): Promise<BillEntity[]> {
    return [];
  }
  async drop(): Promise<void> {}
}
