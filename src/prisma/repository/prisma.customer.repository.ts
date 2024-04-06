import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../../benchmark-data/repository/customer.repository';
import { PrismaService } from '../prisma.service';
import { LoggerService } from '../../logger/logger.service';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';
import { benchmark } from '../../benchmark-metrics/util/benchmark.helper';
import { BenchmarkMetricsService } from '../../benchmark-metrics/service/benchmark-metrics.service';
import { customerChunkSizeKey } from '../../config.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService,
    private readonly benchmarkMetricsService: BenchmarkMetricsService,
  ) {}
  async upsertCustomer(customer: CustomerEntity): Promise<CustomerEntity> {
    return await this.prismaService.customers.upsert({
      where: { id: customer.id },
      // we don't want to insert children so we have to add empty objects to conform to prisma's interface
      create: { ...customer, orders: {}, bills: {} },
      update: { ...customer, orders: {}, bills: {} },
    });
  }
  async upsertCustomerWithChildren(customer: CustomerEntity): Promise<void> {
    // can't return here to conform with the interface we derived from drizzle implementation. just return result if you're interested in the upserted entitiy
    await this.prismaService.customers.upsert({
      where: { id: customer.id },
      create: {
        ...customer,
        bills: {},
        orders: {
          createMany: {
            data: customer.orders,
          },
        },
      },
      update: {
        ...customer,
        bills: {},
        orders: {
          updateMany: {
            // TODO: test if this empty where clause works, but the Prisma docs look like this would be the way to update "all" related orders
            where: {},
            data: customer.orders,
          },
        },
      },
    });
  }

  async insertManyCustomers(customers: CustomerEntity[]): Promise<void> {
    const chunkSize =
      parseInt(this.configService.get<string>(customerChunkSizeKey)) || 1000;
    const expectedChunks = Math.ceil(customers.length / chunkSize);
    this.loggerService.log(
      `Expecting ${expectedChunks} customer chunks of size ${chunkSize}`,
    );
    for (let i = 0; i < customers.length; i += chunkSize) {
      const chunk = customers.slice(i, i + chunkSize);
      await benchmark(
        'PRISMA: insert customer chunks with addresses',
        this.insertManyWithChildren.bind(this),
        this.benchmarkMetricsService.resultMap,
        chunk,
      );
      this.loggerService.log(
        `customer chunk ${i / chunkSize + 1} of ${expectedChunks} done!`,
      );
    }
  }

  private async insertManyWithChildren(customerEntities: CustomerEntity[]) {
    // "real" nested writes are not supported: https://github.com/prisma/prisma/issues/5455 - so the following is some kind of workaround
    // my understanding is that making it work within a transaction is only possible if you pre-generate the ids to assign them to the dependent entity in the mapping function
    await this.prismaService.$transaction([
      this.prismaService.customers.createMany({
        data: customerEntities.map((customer) => {
          return {
            id: customer.id,
            createdAtUtc: customer.createdAtUtc,
            updatedAtUtc: customer.updatedAtUtc,
            customerStatus: customer.status,
            companyName: customer.companyName,
          };
        }),
      }),
      this.prismaService.customers_address.createMany({
        data: customerEntities.map((customer) => {
          return {
            customerId: customer.id,
            ...customer.address,
          };
        }),
      }),
    ]);
  }

  async findAll(): Promise<CustomerEntity[]> {
    const chunkSize = 1000;
    const countInDb = await this.prismaService.customers.count();
    const expectedChunks = Math.ceil(countInDb / chunkSize);
    const result = [];
    for (let i = 0; i <= countInDb; i += chunkSize) {
      console.log(
        `Prisma reading customer chunk ${
          Math.ceil(i / chunkSize) + 1
        } of ${expectedChunks}`,
      );
      result.push(
        await this.prismaService.customers.findMany({
          include: {
            customersAddress: true,
            orders: {
              include: {
                orderedParts: true,
              },
            },
            bills: true,
            marketingCampaignsOnCustomers: true,
          },
          skip: i,
          take: chunkSize,
        }),
      );
    }
    return result.flat() as CustomerEntity[];
  }

  async findById(customerId: string): Promise<CustomerEntity> {
    return (await this.prismaService.customers.findFirst({
      where: { id: customerId },
    })) as CustomerEntity;
  }

  async drop(): Promise<void> {
    await this.prismaService.customers.deleteMany({});
  }
}
