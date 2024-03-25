import { TimestampedEntity } from './timestamped.entity';

export class AddressEntity implements TimestampedEntity {
  id: string;
  country: string;
  state?: string | null;
  city: string;
  postalCode: string;
  address: string;
  createdAtUtc?: Date;
  updatedAtUtc?: Date;
  customerId: string;
}
