import { Inject, Injectable } from '@nestjs/common';
import { CustomerEntity } from '../../../benchmark-data/model/customer.entity';
import { DrizzleAsyncProvider } from '../../drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as customersSchema from '../../schema/customers';
import * as ordersSchema from '../../schema/orders';
import { BenchmarkMetricsService } from '../../../benchmark-metrics/service/benchmark-metrics.service';
import { benchmark } from '../../../benchmark-metrics/util/benchmark.helper';
import { SearchConfig } from '../interfaces';
import { runTypedSearchQuery, updatedEntity } from '../drizzle.helper';
import { ConfigService } from '@nestjs/config';
import { customerAddress } from '../../schema/address';
import { customers } from '../../schema/customers';

@Injectable()
export class CustomerDrizzleRepository {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly drizzle: NodePgDatabase<typeof customersSchema>,
    private readonly benchmarkService: BenchmarkMetricsService,
    private readonly configService: ConfigService,
  ) { }

  async upsertCustomer(customer: CustomerEntity): Promise<CustomerEntity> {
    return (await this.drizzle
      .insert(customers)
      .values(customer)
      .onConflictDoUpdate({
        target: customers.id,
        set: updatedEntity(customer),
      })
      .returning()[0]) as Promise<CustomerEntity>;
  }

  async upsertManyCustomers(customers: CustomerEntity[]): Promise<void> {
    // WARNING: there seems to be an issue with big transaction sizes / many inserts, for 10_000 records it just breaks with
    // bind message has 4464 parameters but 0 parameters or something like that
    // or with "Maximum call stack size exceeded" error, so we use chunks (better transaction-wise anyway)
    // TODO: think if this can be parallelized with Promise.all
    const chunkSize =
      parseInt(this.configService.get<string>('CUSTOMER_CHUNK_SIZE')) || 1000;
    const expectedChunks = Math.ceil(customers.length / chunkSize);
    console.log(`Expecting ${expectedChunks} chunks of size ${chunkSize}`);
    for (let i = 0; i < customers.length; i += chunkSize) {
      const chunk = customers.slice(i, i + chunkSize);
      await benchmark(
        'DRIZZLE: insert customer chunks with addresses',
        this.upsertManyWithChildren.bind(this),
        this.benchmarkService.resultMap,
        chunk,
      );
      console.log(`chunk ${i / chunkSize + 1} of ${expectedChunks} done!`);
    }
  }

  // TODO: technically this right now only is "insert" and not "upsert"
  // because it doesn't update the existing records
  private async upsertManyWithChildren(customerEntities: CustomerEntity[]) {
    await this.drizzle.transaction(async (tx) => {
      await tx
        .insert(customers)
        .values(customerEntities)
        .returning({ customerId: customers.id });

      await tx
        .insert(customerAddress)
        .values(customerEntities.map((customer) => customer.address))
        .execute();
    });
  }

  // TODO: technically this right now only is "insert" and not "upsert"
  // because it doesn't update the existing records
  async upsertCustomerWithChildren(customer: CustomerEntity) {
    await this.drizzle.transaction(async (tx) => {
      const result = await tx
        .insert(customers)
        .values(customer)
        .returning({ customerId: customers.id });

      await tx
        .insert(customerAddress)
        .values({ ...customer.address, customerId: result[0].customerId })
        .execute();

      await tx
        .insert(ordersSchema.orders)
        .values(
          customer.orders.map((order) => ({
            ...order,
            customerId: result[0].customerId,
          })),
        )
        .execute();
    });
  }

  findAll(): Promise<CustomerEntity[]> {
    return this.drizzle.query.customers
      .findMany({
        with: {
          address: true,
          customersOrders: {
            orderedParts: true,
          },
          bills: true,
        },
      })
      .execute() as unknown as Promise<CustomerEntity[]>;
  }

  findById(customerId: string): Promise<CustomerEntity> {
    const searchConfig: SearchConfig<string> = {
      searchKeys: 'id',
      searchValues: customerId,
      withChildren: ['address', 'orders'],
    };
    return runTypedSearchQuery<CustomerEntity>(this.drizzle, searchConfig);
  }

  async drop(): Promise<void> {
    await this.drizzle.delete(customers).execute();
  }
}
