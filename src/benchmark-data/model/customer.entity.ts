import { AddressEntity } from './address.entity';
import { BillEntity } from './bill.entity';
import { CustomerStatusEnum } from './customer.enums';
import { OrderEntity } from './order.entity';
import { TimestampedEntity } from './timestamped.entity';
import { MarketingCampaignEntity } from './marketing-campaign.entity';

export class CustomerEntity implements TimestampedEntity {
  id: string;
  companyName: string;
  status?: CustomerStatusEnum;
  createdAtUtc?: Date;
  updatedAtUtc?: Date;
  address?: AddressEntity;
  orders?: OrderEntity[] = [];
  bills?: BillEntity[] = [];
  marketingCampaigns?: MarketingCampaignEntity[] = [];
}
