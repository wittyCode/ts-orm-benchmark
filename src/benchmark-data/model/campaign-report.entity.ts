import { AddressEntity } from './address.entity';

export class CampaignReportEntity {
  marketingCampaignId: string;
  marketingCampaignName: string;
  customerId: string;
  customerName: string;
  customerAddress: AddressEntity;
}
