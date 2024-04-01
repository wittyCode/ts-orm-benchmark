import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../../benchmark-data/repository/orders.repository';
import { BillEntity } from '../../benchmark-data/model/bill.entity';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';
import { OrderEntity } from '../../benchmark-data/model/order.entity';
import { OrderedPartEntity } from '../../benchmark-data/model/ordered-part.entity';

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  async upsertManyOrdersFromCustomersAsChunks(
    customers: CustomerEntity[],
  ): Promise<void> {}
  async updateOrderedPartWithBillId(
    orderedPartsEntities: OrderedPartEntity[],
    bills: BillEntity[],
  ): Promise<void> {}
  async findAll(): Promise<OrderEntity[]> {
    return [];
  }
  async drop(): Promise<void> {}
}
