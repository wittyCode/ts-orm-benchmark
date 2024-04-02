import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../../benchmark-data/repository/orders.repository';
import { BillEntity } from '../../benchmark-data/model/bill.entity';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';
import { OrderEntity } from '../../benchmark-data/model/order.entity';
import { OrderedPartEntity } from '../../benchmark-data/model/ordered-part.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {

  constructor(private readonly prismaService: PrismaService) { }

  async upsertManyOrdersFromCustomersAsChunks(
    customers: CustomerEntity[],
  ): Promise<void> { }

  async updateOrderedPartWithBillId(
    orderedPartsEntities: OrderedPartEntity[],
    bills: BillEntity[],
  ): Promise<void> { }

  async findAll(): Promise<OrderEntity[]> {
    const result = await this.prismaService.orders.findMany({
      include: {
        orderedParts: true,
      }
    });
    return result as OrderEntity[];
  }

  async drop(): Promise<void> {
    await this.prismaService.orders.deleteMany({});
  }
}
