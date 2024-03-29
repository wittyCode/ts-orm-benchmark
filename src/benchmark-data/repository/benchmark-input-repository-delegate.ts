import { BillsRepository } from './bills.repository';
import { CustomerRepository } from './customer.repository';
import { MarketingCampaignsRepository } from './marketing-campaigns.repository';
import { OrdersRepository } from './orders.repository';

export interface BenchmarkInputRepositoryDelegate {
  customerRepository: CustomerRepository;
  ordersRepository: OrdersRepository;
  billsRepository: BillsRepository;
  marketingCampaignsRepository: MarketingCampaignsRepository;
}
