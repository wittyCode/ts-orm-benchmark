import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderEntity } from '../../benchmark-data/model/order.entity';
import { v4 as uuid } from 'uuid';
import { OrderedPartEntity } from '../../benchmark-data/model/ordered-part.entity';

export const orderedPartsAmountFactorKey = 'ORDERED_PARTS_FACTOR';

@Injectable()
export class OrderFakerService {
  constructor(private readonly configService: ConfigService) {}

  createMockOrders(maxAmount: number, customerId: string): OrderEntity[] {
    const amount = faker.number.int({ min: 1, max: maxAmount });
    const result: OrderEntity[] = [];
    for (let i = 0; i < amount; i++) {
      result.push(this.createRandomOrder(customerId));
    }
    return result;
  }

  createRandomOrder(customerId: string): OrderEntity {
    const id = uuid();
    const mockOrderedPartsMaxAmount =
      parseInt(this.configService.get<string>(orderedPartsAmountFactorKey)) ||
      10;
    return {
      id,
      customerId,
      orderNumber: faker.number.int({ min: 1, max: 10_000_000 }),
      orderDate: faker.date.past(),
      orderedParts: this.createMockOrderedParts(mockOrderedPartsMaxAmount, id),
    };
  }

  createMockOrderedParts(
    maxAmount: number,
    orderId: string,
  ): OrderedPartEntity[] {
    const amount = faker.number.int({ min: 1, max: maxAmount });
    const result: OrderedPartEntity[] = [];
    for (let i = 0; i < amount; i++) {
      result.push(this.createRandomOrderedPart(orderId));
    }
    return result;
  }

  createRandomOrderedPart(orderId: string): OrderedPartEntity {
    return {
      orderId,
      id: uuid(),
      name: faker.lorem.word(),
      amount: faker.number.int({ min: 10, max: 100_000 }),
      pricePerUnit: faker.number.float({ min: 10, max: 100_000 }),
    };
  }
}
