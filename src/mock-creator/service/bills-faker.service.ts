import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';
import { BillEntity } from '@/benchmark-data/model/bill.entity';

@Injectable()
export class BillsFakerService {
  createMockEntities(amount: number, customerIds: string[]) {
    const result: BillEntity[] = [];
    console.log('given amount', amount);
    for (let i = 0; i < amount; i++) {
      const customerId = faker.helpers.arrayElement(customerIds);
      const entity = this.createMock(customerId);
      result.push(entity);
    }
    return result;
  }

  createMock(customerId: string): BillEntity {
    return {
      id: uuid(),
      customerId,
      billNumber: faker.number.int({ min: 1, max: 10_000_000 }),
    };
  }
}
