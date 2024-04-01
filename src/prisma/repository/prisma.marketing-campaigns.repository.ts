import { Injectable } from '@nestjs/common';
import {
  MarketingCampaignToCustomer,
  MarketingCampaignsRepository,
} from '../../benchmark-data/repository/marketing-campaigns.repository';
import { CampaignReportEntity } from '../../benchmark-data/model/campaign-report.entity';
import { MarketingCampaignEntity } from '../../benchmark-data/model/marketing-campaign.entity';

Injectable();
export class PrismaMarketingCampaignRepository
  implements MarketingCampaignsRepository
{
  async linkMarketingCampaignsToCustomers(
    marketingCampaignsToCustomer: MarketingCampaignToCustomer[],
  ): Promise<void> {}
  async upsertManyMarketingCampaigns(
    marketingCampaigns: MarketingCampaignEntity[],
  ): Promise<void> {}
  async findAll(): Promise<MarketingCampaignEntity[]> {
    return [];
  }
  async drop(): Promise<void> {}
  async findAddressesInCampaigns(): Promise<CampaignReportEntity[]> {
    return [];
  }
}
