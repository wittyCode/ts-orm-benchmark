import { BillEntity } from '../model/bill.entity';

export interface BillsRepository {
  upsertManyBills(bills: BillEntity[]): Promise<void>;
  findAll(): Promise<BillEntity[]>;
  drop(): Promise<void>;
}
