import { MarketingCampaignEntity } from '../model/marketing-campaign.entity';

export interface MarketingCampaignsRepository {
  upsertManyMarketingCampaigns(
    marketingCampaigns: MarketingCampaignEntity[],
  ): Promise<void>;
  findAll(): Promise<MarketingCampaignEntity[]>;
  drop(): Promise<void>;
}
