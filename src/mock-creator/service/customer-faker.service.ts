import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';
import { v4 as uuid } from 'uuid';
import { AddressEntity } from '../../benchmark-data/model/address.entity';
import { CustomerStatusEnum } from '../../benchmark-data/model/customer.enums';
import { ConfigService } from '@nestjs/config';
import { OrderFakerService } from './order-faker.service';

export const orderAmountFactorKey = 'ORDER_AMOUNT_FACTOR';

@Injectable()
export class CustomerFakerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly orderFakerService: OrderFakerService,
  ) {}

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
    const orders = this.orderFakerService.createMockOrders(orderFactor, id);
    return {
      id,
      companyName: faker.company.name(),
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
}
