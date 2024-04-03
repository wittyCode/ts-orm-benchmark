import { AddressEntity } from './address.entity';

export class CampaignReportEntity {
  marketingCampaignId: string;
  marketingCampaignName: string;
  customers: CampaignReportCustomerEntity[];
}

export class CampaignReportCustomerEntity {
  customerId: string;
  customerName: string;
  customerAddress: AddressEntity;
}
