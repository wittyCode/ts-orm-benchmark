import { CustomerEntity } from '../model/customer.entity';

export interface CustomerRepository {
  upsertCustomer(customer: CustomerEntity): Promise<CustomerEntity>;
  upsertManyCustomers(customers: CustomerEntity[]): Promise<void>;
  upsertCustomerWithChildren(customer: CustomerEntity): Promise<void>;
  findAll(): Promise<CustomerEntity[]>;
  findById(customerId: string): Promise<CustomerEntity>;
  drop(): Promise<void>;
}
