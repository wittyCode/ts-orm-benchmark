import { TimestampedEntity } from './timestamped.entity';

export class OrderedPartEntity implements TimestampedEntity {
  id: string;
  name: string;
  amount: number;
  pricePerUnit: number;
  orderId: string;
  billId?: string;

  createdAtUtc?: Date;
  updatedAtUtc?: Date;
}
