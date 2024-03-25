import { TimestampedEntity } from './timestamped.entity';

export class BillEntity implements TimestampedEntity {
  id: string;
  customerId: string;
  billNumber: number;

  createdAtUtc?: Date;
  updatedAtUtc?: Date;
}
