import { BillEntity } from '../model/bill.entity';

export interface BillsRepository {
  insertManyBills(bills: BillEntity[]): Promise<void>;
  findAll(): Promise<BillEntity[]>;
  drop(): Promise<void>;
}
