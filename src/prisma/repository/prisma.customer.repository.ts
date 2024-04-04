import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../../benchmark-data/repository/customer.repository';
import { PrismaService } from '../prisma.service';
import { LoggerService } from '../../logger/logger.service';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService,
  ) {}
  upsertCustomer(customer: CustomerEntity): Promise<CustomerEntity> {
    throw new Error('Method not implemented.');
  }
  upsertCustomerWithChildren(customer: CustomerEntity): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async upsertManyCustomers(customers: CustomerEntity[]): Promise<void> {
    // TODO: benchmarking and batching as in drizzle => this currently is just a simple for loop
    let iteration = 0;
    //for (const customer of customers) {
    //await this.prismaService.customers.upsert({
    //  where: { id: customer.id },
    //  create: {
    //    status: customer.status,
    //    ...customer,
    //    customersAddress: {
    //      connectOrCreate: {
    //        create: { ...customer.address },
    //        where: {
    //          customerId: customer.id,
    //          id: customer.id,
    //        },
    //      },
    //    },
    //  },
    //  update: {
    //    ...customer,
    //    customersAddress: {
    //      connectOrCreate: {
    //        create: { ...customer.address },
    //        where: {
    //          id: customer.id,
    //        },
    //      },
    //    },
    //  },
    //});
    //if (iteration % 100 === 0) {
    //  // TODO find out how to acccess "this" here
    //  console.log(`inserting batch ${iteration / 100}`);
    //}
    //iteration++;
    //}
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
