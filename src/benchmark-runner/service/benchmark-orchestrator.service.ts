import { Injectable } from '@nestjs/common';
import { BenchmarkMetricsService } from '../../benchmark-metrics/service/benchmark-metrics.service';
import { CreateMockService } from '../../mock-creator/service/create-mock.service';
import { LoggerService } from '../../logger/logger.service';
import { benchmark } from '../../benchmark-metrics/util/benchmark.helper';
import { CustomerDrizzleRepository } from '../../drizzle/repository/customer/customer.drizzle.repository';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';
import { OrderEntity } from '../../benchmark-data/model/order.entity';
import { OrderDrizzleRepository } from '../../drizzle/repository/orders/order.drizzle.repository';
import { BillsDrizzleRepository } from '../../drizzle/repository/bills/bills.drizzle.repository';
import { BillEntity } from '../../benchmark-data/model/bill.entity';

export enum BenchmarkType {
  DRIZZLE = 'drizzle',
  TYPEORM = 'typeorm',
  PRISMA = 'prisma',
  MIKRO_ORM = 'mikro-orm',
  KNEX = 'knex',
  KYSELY = 'kysely',
  OBJECTIONJS = 'objectionjs',
  SEQUELIZE = 'sequelize',
}

@Injectable()
export class BenchmarkOrchestratorService {
  constructor(
    private readonly createMockService: CreateMockService,
    private readonly benchmarkService: BenchmarkMetricsService,
    private readonly customerDrizzleRepository: CustomerDrizzleRepository,
    private readonly orderDrizzleRepository: OrderDrizzleRepository,
    private readonly billDrizzleRepository: BillsDrizzleRepository,
    private readonly loggerService: LoggerService,
  ) {}

  async resetBenchmark(): Promise<void> {
    this.loggerService.log('Resetting benchmark');
    // FK cascading deletes will delete addresses, orders as well
    await this.customerDrizzleRepository.drop();
    await this.billDrizzleRepository.drop();
    this.benchmarkService.resultMap.clear();
  }

  /*
    have separate benchmarks for inserts and different types or reads/reports
   */
  async runInsertBenchmark(
    dbDriver: BenchmarkType,
    customerSize: number,
  ): Promise<number> {
    const startTime = performance.now();
    this.loggerService.log(`Benchmark for ${dbDriver} started!`);

    this.loggerService.log(
      `Benchmark for inserts started with size ${customerSize}`,
    );
    // 1. create fake entities (do that in the beginning or do it for each entity? => probably for each, due to large sizes of later entities)
    this.loggerService.log(`Creating ${customerSize} fake customers`);
    const customerEntities =
      await this.createMockService.createMockCustomers(customerSize);

    const ordersFlat = customerEntities.map((entity) => entity.orders).flat();
    const orderCount = ordersFlat.length;

    const orderedPartsFlatCount = ordersFlat
      .map((entity) => entity.orderedParts)
      .flat().length;

    const billSize = customerSize;
    this.loggerService.log(`Creating ${billSize} fake bills`);
    const billEntities = await this.createMockService.createMockBills(
      billSize,
      customerEntities.map((it) => it.id),
    );

    const sumOfAll =
      customerEntities.length +
      orderCount +
      orderedPartsFlatCount +
      billEntities.length;

    this.loggerService.log(
      `
      Creation of test data set with size ${customerSize} successful:
      ${customerEntities.length} customer entities created!
      ${orderCount} order entities created!
      ${orderedPartsFlatCount} ordered part data entries created!
      ${billEntities.length} bill entities created!
      `,
    );

    // 2. insert customers with address, orders
    this.loggerService.log('Inserting customers');
    await benchmark(
      'insertAllCustomers',
      this.customerDrizzleRepository.upsertManyCustomers.bind(
        this.customerDrizzleRepository,
      ),
      this.benchmarkService.resultMap,
      customerEntities,
    );

    // 3. insert orders with orderedParts
    this.loggerService.log('Inserting orders');
    await benchmark(
      'insertAllOrders',
      this.orderDrizzleRepository.upsertManyOrdersFromCustomersAsChunks.bind(
        this.orderDrizzleRepository,
      ),
      this.benchmarkService.resultMap,
      customerEntities,
    );

    // 4. insert bills
    this.loggerService.log('Inserting bills');
    await benchmark(
      'insertAllBills',
      this.billDrizzleRepository.upsertManyBills.bind(
        this.billDrizzleRepository,
      ),
      this.benchmarkService.resultMap,
      billEntities,
    );

    // 4a. update ordered parts data entries with relation to billIds
    this.loggerService.log('Updating ordered part data entries with billId');
    const orderedParts = ordersFlat.map((entity) => entity.orderedParts).flat();
    await benchmark(
      'updateOrderedPartsWithBillIds',
      this.orderDrizzleRepository.updateOrderedPartWithBillId.bind(
        this.orderDrizzleRepository,
      ),
      this.benchmarkService.resultMap,
      orderedParts,
      billEntities,
    );

    // 5. insert marketing campaigns

    // 6. insert jointable marketing campaing <-> customers

    const duration = performance.now() - startTime;
    this.loggerService.log(
      // TODO: conditional pretty printing depending on duration (ms, s, min)
      `Benchmark for ${dbDriver} finished in ${Math.round(
        duration / 1000,
      )} seconds!,
      ${sumOfAll} entities created overall!`,
    );
    return Math.round(duration);
  }

  async runReadBenchmark(
    dbDriver: BenchmarkType,
    // TODO: make batchsize part of this
    //customerSize: number,
  ): Promise<number> {
    const startTime = performance.now();
    this.loggerService.log(`Benchmark for ${dbDriver} started!`);
    //this.loggerService.log(
    //  `Benchmark for reads started with size ${customerSize}`,
    //);

    // 1. find all customers
    this.loggerService.log('Reading customers');
    const customers = await benchmark<CustomerEntity[]>(
      'findAllCustomers',
      this.customerDrizzleRepository.findAll.bind(
        this.customerDrizzleRepository,
      ),
      this.benchmarkService.resultMap,
    );
    this.loggerService.log(`Found ${customers.length} customers`);

    // 3. find all orders with ordered parts
    this.loggerService.log('Reading orders');
    const orders = await benchmark<OrderEntity[]>(
      'findAllOrders',
      this.orderDrizzleRepository.findAll.bind(this.orderDrizzleRepository),
      this.benchmarkService.resultMap,
    );
    this.loggerService.log(`Found ${orders.length} orders`);

    // 4. find all bills
    this.loggerService.log('Reading bills');
    const bills = await benchmark<BillEntity[]>(
      'findAllBills',
      this.billDrizzleRepository.findAll.bind(this.billDrizzleRepository),
      this.benchmarkService.resultMap,
    );
    this.loggerService.log(`Found ${bills.length} bills`);

    // 5. find all marketing campaigns

    const duration = performance.now() - startTime;
    this.loggerService.log(
      // TODO conditional pretty printing depending on duration (ms, s, min)
      `Benchmark for ${dbDriver} finished in ${Math.round(
        duration / 1000,
      )} seconds!`,
    );
    return Math.round(duration);
  }
}
