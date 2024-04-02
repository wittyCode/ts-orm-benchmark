import { Injectable } from '@nestjs/common';
import {
  MarketingCampaignToCustomer,
  MarketingCampaignsRepository,
} from '../../benchmark-data/repository/marketing-campaigns.repository';
import { CampaignReportEntity } from '../../benchmark-data/model/campaign-report.entity';
import { MarketingCampaignEntity } from '../../benchmark-data/model/marketing-campaign.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaMarketingCampaignRepository
  implements MarketingCampaignsRepository
{
  constructor(private readonly prismaService: PrismaService) {}

  async linkMarketingCampaignsToCustomers(
    marketingCampaignsToCustomer: MarketingCampaignToCustomer[],
  ): Promise<void> {}

  async upsertManyMarketingCampaigns(
    marketingCampaigns: MarketingCampaignEntity[],
  ): Promise<void> {}

  async findAll(): Promise<MarketingCampaignEntity[]> {
    return (await this.prismaService.marketing_campaigns.findMany({
      include: {
        marketingCampaignsOnCustomers: true,
      },
    })) as MarketingCampaignEntity[];
  }

  async drop(): Promise<void> {
    await this.prismaService.marketing_campaigns_on_customers.deleteMany();
    await this.prismaService.marketing_campaigns.deleteMany();
  }

  async findAddressesInCampaigns(): Promise<CampaignReportEntity[]> {
    return [];
  }
}
