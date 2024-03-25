import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';
import { v4 as uuid } from 'uuid';
import { AddressEntity } from '../../benchmark-data/model/address.entity';
import { CustomerStatusEnum } from '../../benchmark-data/model/customer.enums';
import { ConfigService } from '@nestjs/config';
import { OrderEntity } from '../../benchmark-data/model/order.entity';
import { OrderedPartEntity } from '../../benchmark-data/model/ordered-part.entity';

export const orderAmountFactorKey = 'ORDER_AMOUNT_FACTOR';

@Injectable()
export class CustomerFakerService {
  constructor(private readonly configService: ConfigService) {}

  async createMockEntities(amount: number) {
    return this.createRandomCustomers(amount);
  }

  createRandomCustomers(amount: number): CustomerEntity[] {
    const result: CustomerEntity[] = [];
    for (let i = 0; i < amount; i++) {
      result.push(this.createMockCustomer());
    }
    return result;
  }

  createMockCustomer(): CustomerEntity {
    const id = uuid();
    const address = this.mockAddress(id);
    // TODO: move orderMock to its own faker service
    const orderFactor =
      parseInt(this.configService.get<string>(orderAmountFactorKey)) || 25;
    const orders = this.createMockOrders(orderFactor, id);
    return {
      id,
      companyName: faker.company.name(),
      slug: uuid(),
      address,
      orders,
      status: faker.helpers.enumValue(CustomerStatusEnum),
    };
  }

  mockAddress(customerId: string): AddressEntity {
    return {
      id: uuid(),
      city: faker.location.city(),
      country: faker.location.country(),
      postalCode: faker.location.zipCode(),
      address: faker.location.streetAddress(),
      state: faker.location.state(),
      customerId,
    };
  }

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
      parseInt(this.configService.get<string>('ORDERED_PARTS_FACTOR')) || 10;
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
