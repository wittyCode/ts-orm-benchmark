import { BillEntity } from '../model/bill.entity';
import { CustomerEntity } from '../model/customer.entity';
import { OrderEntity } from '../model/order.entity';
import { OrderedPartEntity } from '../model/ordered-part.entity';

export interface OrdersRepository {
  upsertManyOrdersFromCustomersAsChunks(
    customers: CustomerEntity[],
  ): Promise<void>;
  updateOrderedPartWithBillId(
    orderedPartsEntities: OrderedPartEntity[],
    bills: BillEntity[],
  ): Promise<void>;
  findAll(): Promise<OrderEntity[]>;
  drop(): Promise<void>;
}
