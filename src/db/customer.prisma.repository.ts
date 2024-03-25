// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../../db/prisma.service';
// import { CustomerRepository } from './customer.repository';
// import { CustomerEntity } from 'src/customers/model/customer.entity';
// import { LoggerService } from '../../logger/logger.service';
//
// @Injectable()
// export class CustomerPrismaRepository implements CustomerRepository {
//   constructor(
//     private readonly prismaService: PrismaService,
//     private readonly loggerService: LoggerService,
//   ) {}
//
//   async upsertMany(customers: CustomerEntity[]): Promise<number> {
//     let iteration = 0;
//     for (const customer of customers) {
//       await this.prismaService.customerEntity.upsert({
//         where: { slug: customer.slug },
//         create: {
//           status: customer.status,
//           ...customer,
//           address: {
//             connectOrCreate: {
//               create: { ...customer.address },
//               where: {
//                 customerId: customer.id,
//               },
//             },
//           },
//         },
//         update: {
//           ...customer,
//           address: {
//             connectOrCreate: {
//               create: { ...customer.address },
//               where: {
//                 customerId: customer.id,
//               },
//             },
//           },
//         },
//       });
//       if (iteration % 100 === 0) {
//         // TODO find out how to acccess "this" here
//         console.log(`inserting batch ${iteration / 100}`);
//       }
//       iteration++;
//     }
//     return customers.length;
//   }
//
//   async findAll(): Promise<CustomerEntity[]> {
//     return (await this.prismaService.customerEntity.findMany()) as CustomerEntity[];
//   }
//
//   async findById(customerId: string): Promise<CustomerEntity> {
//     return (await this.prismaService.customerEntity.findFirst({
//       where: { id: customerId },
//     })) as CustomerEntity;
//   }
//
//   async findBySlug(slug: string): Promise<CustomerEntity> {
//     return (await this.prismaService.customerEntity.findFirst({
//       where: { slug },
//       include: {
//         address: true,
//       },
//     })) as CustomerEntity;
//   }
//
//   async drop(): Promise<void> {
//     await this.prismaService.customerEntity.deleteMany({});
//   }
// }
