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
  async upsertCustomer(customer: CustomerEntity): Promise<CustomerEntity> {
    return await this.prismaService.customers.upsert({
      where: { id: customer.id },
      // we don't want to insert children so we have to add empty objects to conform to prisma's interface
      create: { ...customer, orders: {}, bills: {} },
      update: { ...customer, orders: {}, bills: {} },
    });
  }
  async upsertCustomerWithChildren(customer: CustomerEntity): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async upsertManyCustomers(customers: CustomerEntity[]): Promise<void> {}

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
