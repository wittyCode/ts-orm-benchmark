import { TimestampedEntity } from './timestamped.entity';

export class MarketingCampaignEntity implements TimestampedEntity {
  id: string;
  name: string;
  startDate: Date;
  // campaigns without endDate run indefinitely
  endDate?: Date;
  createdAtUtc?: Date;
  updatedAtUtc?: Date;
}
