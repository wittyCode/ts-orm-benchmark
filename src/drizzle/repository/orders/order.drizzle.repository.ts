import { Inject, Injectable } from '@nestjs/common';
import { CustomerEntity } from '../../../benchmark-data/model/customer.entity';
import { DrizzleAsyncProvider } from '../../drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as orderSchema from '../../schema/orders';
import { orderedParts } from '../../schema/ordered-parts';
import { BenchmarkMetricsService } from '../../../benchmark-metrics/service/benchmark-metrics.service';
import { benchmark } from '../../../benchmark-metrics/util/benchmark.helper';
import { OrderEntity } from '../../../benchmark-data/model/order.entity';
import { ConfigService } from '@nestjs/config';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';
import { LoggerService } from '../../../logger/logger.service';
import { OrderedPartEntity } from '../../../benchmark-data/model/ordered-part.entity';
import { BillEntity } from '../../../benchmark-data/model/bill.entity';

@Injectable()
export class OrderDrizzleRepository {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly drizzle: NodePgDatabase<typeof orderSchema>,
    private readonly benchmarkService: BenchmarkMetricsService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  async upsertManyOrdersFromCustomersAsChunks(
    customers: CustomerEntity[],
  ): Promise<void> {
    const orders = customers
      .map(this.mapCustomersOrders)
      .reduce((acc, val) => acc.concat(val.orders), []);
    console.log(
      `Inserting ${orders.length} orders from ${customers.length} customers`,
    );
    const chunkSize =
      parseInt(this.configService.get<string>('ORDER_CHUNK_SIZE')) || 100;
    const expectedChunks =
      orders.length >= chunkSize
        ? Math.ceil(orders.length / chunkSize)
        : orders.length;
    console.log(`Expecting ${expectedChunks} chunks with size ${chunkSize}`);
    for (let i = 0; i < orders.length; i += chunkSize) {
      const chunk = orders.slice(i, i + chunkSize);
      await benchmark(
        `DRIZZLE: insert order Chunk of size ${chunkSize} with ordered parts data`,
        this.upsertMany.bind(this),
        this.benchmarkService.resultMap,
        chunk,
      );
      console.log(`chunk ${i / chunkSize + 1} of ${expectedChunks} done!`);
    }
  }

  // TODO: technically this right currently only is "insert" and not "upsert"
  // because it doesn't update the existing records => see comment at update of orderedparts for idea of bulk updates
  private async upsertMany(orders: OrderEntity[]) {
    const orderedPartsEntities = orders
      .map(this.mapOrderedPart)
      .reduce((acc, val) => acc.concat(val.orderedParts), []);
    // TODO: maybe this might need smaller chunks, depending on the size of the orderedPartChunk because it's up to x10
    await this.drizzle.transaction(async (tx) => {
      await tx.insert(orderSchema.orders).values(orders).execute();

      await tx.insert(orderedParts).values(orderedPartsEntities).execute();
    });
  }

  private mapCustomersOrders(customer: CustomerEntity) {
    return {
      customerId: customer.id,
      orders: customer.orders.map((order) => ({
        ...order,
      })),
    };
  }

  private mapOrderedPart(order: OrderEntity) {
    return {
      orderId: order.id,
      orderedParts: order.orderedParts.map((orderedParts) => ({
        ...orderedParts,
      })),
    };
  }

  async updateOrderedPartWithBillId(
    orderedPartsEntities: OrderedPartEntity[],
    bills: BillEntity[],
  ) {
    this.loggerService.log('Updating OrderedPart Entities');
    const chunkSize = 1000;
    const billIds = bills.map((it) => it.id);
    orderedPartsEntities.forEach(
      (it) => (it.billId = faker.helpers.arrayElement(billIds)),
    );

    const expectedChunks =
      orderedPartsEntities.length >= chunkSize
        ? Math.ceil(orderedPartsEntities.length / chunkSize)
        : orderedPartsEntities.length;
    console.log(`Expecting ${expectedChunks} chunks with size ${chunkSize}`);

    for (let i = 0; i < orderedPartsEntities.length; i += chunkSize) {
      const chunk = orderedPartsEntities.slice(i, i + chunkSize);
      // TODO: horrible performance due to one transaction per update.
      // https://github.com/drizzle-team/drizzle-orm/issues/1794

      //await Promise.all(
      //  chunk.map((update: OrderedPartsEntity) =>
      //    this.drizzle
      //      .update(orderedPartsSchema.orderedParts)
      //      .set(update)
      //      .where(eq(orderedPartsSchema.orderedParts.id, update.id)),
      //  ),
      //);

      // Better performance following the proposal at: https://orm.drizzle.team/learn/guides/upsert
      // but unclear if this is good DX for multiple fields that need to be updated.
      // linked guide provides syntactic sugar to fix this - maybe that can even be further improved
      // also look into possibly combining this with spreading the object and prepending the raw sql
      await benchmark(
        `DRIZZLE: update ordered part data chunk of size ${chunkSize} with billIds`,
        this.executeChunkUpdateOfOrderedParts.bind(this),
        this.benchmarkService.resultMap,
        chunk,
      );
      console.log(`chunk ${i / chunkSize + 1} of ${expectedChunks} done!`);
    }
  }

  private executeChunkUpdateOfOrderedParts(chunk: OrderedPartEntity[]) {
    this.drizzle
      .insert(orderedParts)
      .values(chunk)
      .onConflictDoUpdate({
        target: orderedParts.id,
        set: {
          billId: sql.raw(`excluded.${orderedParts.billId.name}`),
        },
      })
      .execute();
  }

  // TODO: implement limit and offset for this as POC
  findAll(): Promise<OrderEntity[]> {
    return this.drizzle.query.orders
      .findMany({
        with: {
          orderedParts: true,
        },
      })
      .execute() as unknown as Promise<OrderEntity[]>;
  }

  async drop(): Promise<void> {
    await this.drizzle.delete(orderSchema.orders).execute();
  }
}
