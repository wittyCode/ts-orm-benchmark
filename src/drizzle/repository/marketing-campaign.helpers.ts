import { AddressEntity } from '../../benchmark-data/model/address.entity';

export class JoinedReport {
  campaignId: string;
  campaignName: string;
  customerId: string;
  customerName: string;
  customerAddress: AddressEntity;
}
