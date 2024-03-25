import { OrderedPartEntity } from './ordered-part.entity';
import { TimestampedEntity } from './timestamped.entity';

export class OrderEntity implements TimestampedEntity {
  id: string;
  orderDate: Date;
  orderNumber: number;
  customerId: string;
  orderedParts?: OrderedPartEntity[];
  createdAtUtc?: Date;
  updatedAtUtc?: Date;
}
