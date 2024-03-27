import { TimestampedEntity } from './timestamped.entity';
import { CustomerEntity } from './customer.entity';

export class MarketingCampaignEntity implements TimestampedEntity {
  id: string;
  name: string;
  startDate: Date;
  // campaigns without endDate run indefinitely
  endDate?: Date;
  customers?: CustomerEntity[];

  createdAtUtc?: Date;
  updatedAtUtc?: Date;
}
