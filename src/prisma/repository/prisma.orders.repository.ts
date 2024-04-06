import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../../benchmark-data/repository/orders.repository';
import { BillEntity } from '../../benchmark-data/model/bill.entity';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';
import { OrderEntity } from '../../benchmark-data/model/order.entity';
import { OrderedPartEntity } from '../../benchmark-data/model/ordered-part.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async insertManyOrdersFromCustomersAsChunks(
    customers: CustomerEntity[],
  ): Promise<void> {}

  async updateOrderedPartWithBillId(
    orderedPartsEntities: OrderedPartEntity[],
    bills: BillEntity[],
  ): Promise<void> {}

  async findAll(): Promise<OrderEntity[]> {
    // WARNING: chunkSize 100 because for 1000 (default chunkSize everywhere else in benchmark) it still broke
    const chunkSize = 100;
    const countInDb = await this.prismaService.orders.count();
    const expectedChunks = Math.ceil(countInDb / chunkSize);
    const result = [];
    for (let i = 0; i <= countInDb; i += chunkSize) {
      console.log(
        `Prisma reading order chunk ${
          Math.ceil(i / chunkSize) + 1
        } of ${expectedChunks}`,
      );
      result.push(
        await this.prismaService.orders.findMany({
          include: {
            orderedParts: true,
          },
          skip: i,
          take: chunkSize,
        }),
      );
    }

    return result.flat() as OrderEntity[];
  }

  async drop(): Promise<void> {
    await this.prismaService.orders.deleteMany({});
  }
}
