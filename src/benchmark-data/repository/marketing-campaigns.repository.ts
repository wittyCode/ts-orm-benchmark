import { CampaignReportEntity } from '../model/campaign-report.entity';
import { MarketingCampaignEntity } from '../model/marketing-campaign.entity';

export interface MarketingCampaignToCustomer {
  customerId: string;
  marketingCampaignId: string;
}

export interface MarketingCampaignsRepository {
  linkMarketingCampaignsToCustomers(
    marketingCampaignsToCustomer: MarketingCampaignToCustomer[],
  ): Promise<void>;
  upsertManyMarketingCampaigns(
    marketingCampaigns: MarketingCampaignEntity[],
  ): Promise<void>;
  findAll(): Promise<MarketingCampaignEntity[]>;
  drop(): Promise<void>;
  // TODO: implement report entity that matches returend type
  findAddressesInCampaigns(): Promise<CampaignReportEntity[]>;
}
