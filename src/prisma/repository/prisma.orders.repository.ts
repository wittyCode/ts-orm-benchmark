import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../../benchmark-data/repository/orders.repository';
import { BillEntity } from '../../benchmark-data/model/bill.entity';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';
import { OrderEntity } from '../../benchmark-data/model/order.entity';
import { OrderedPartEntity } from '../../benchmark-data/model/ordered-part.entity';
import { PrismaService } from '../prisma.service';
import { benchmark } from '../../benchmark-metrics/util/benchmark.helper';
import { ConfigService } from '@nestjs/config';
import { BenchmarkMetricsService } from '../../benchmark-metrics/service/benchmark-metrics.service';
import { LoggerService } from '../../logger/logger.service';
import { orderChunkSizeKey } from '../../config.constants';

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly benchmarkMetricsService: BenchmarkMetricsService,
    private readonly loggerService: LoggerService,
  ) {}

  async updateOrderedPartWithBillId(
    orderedPartsEntities: OrderedPartEntity[],
    bills: BillEntity[],
  ): Promise<void> {}

  async insertManyOrdersFromCustomersAsChunks(
    customers: CustomerEntity[],
  ): Promise<void> {
    const orders = customers
      .map(this.mapCustomersOrders)
      .reduce((acc, val) => acc.concat(val.orders), []);
    this.loggerService.log(
      `Inserting ${orders.length} orders from ${customers.length} customers`,
    );
    const chunkSize =
      parseInt(this.configService.get<string>(orderChunkSizeKey)) || 100;
    const expectedChunks =
      orders.length >= chunkSize
        ? Math.ceil(orders.length / chunkSize)
        : orders.length;
    this.loggerService.log(
      `Expecting ${expectedChunks} chunks with size ${chunkSize}`,
    );
    for (let i = 0; i < orders.length; i += chunkSize) {
      const chunk = orders.slice(i, i + chunkSize);
      await benchmark(
        `PRISMA: insert order Chunk of size ${chunkSize} with ordered parts data`,
        this.insertMany.bind(this),
        this.benchmarkMetricsService.resultMap,
        chunk,
      );
      this.loggerService.log(
        `order chunk ${i / chunkSize + 1} of ${expectedChunks} done!`,
      );
    }
  }

  private async insertMany(orders: OrderEntity[]) {
    const orderedPartsEntities = orders
      .map(this.mapOrderedPart)
      .reduce((acc, val) => acc.concat(val.orderedParts), []);
    // TODO: maybe this might need smaller chunks, depending on the size of the orderedPartChunk because it's up to x10
    await this.prismaService.$transaction([
      this.prismaService.orders.createMany({
        data: orders.map((order) => {
          return {
            id: order.id,
            orderDate: order.orderDate,
            orderNumber: order.orderNumber,
            customerId: order.customerId,
            createdAtUtc: order.createdAtUtc,
            updatedAtUtc: order.updatedAtUtc,
          };
        }),
      }),
      this.prismaService.ordered_parts.createMany({
        data: orderedPartsEntities,
      }),
    ]);
  }

  private mapOrderedPart(order: OrderEntity) {
    return {
      orderId: order.id,
      orderedParts: order.orderedParts.map((orderedParts) => ({
        ...orderedParts,
      })),
    };
  }

  private mapCustomersOrders(customer: CustomerEntity) {
    return {
      customerId: customer.id,
      orders: customer.orders.map((order) => ({
        ...order,
      })),
    };
  }

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
