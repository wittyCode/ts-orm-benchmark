import { Injectable } from '@nestjs/common';
import {
  MarketingCampaignToCustomer,
  MarketingCampaignsRepository,
} from '../../benchmark-data/repository/marketing-campaigns.repository';
import {
  CampaignReportCustomerEntity,
  CampaignReportEntity,
} from '../../benchmark-data/model/campaign-report.entity';
import { MarketingCampaignEntity } from '../../benchmark-data/model/marketing-campaign.entity';
import { PrismaService } from '../prisma.service';
import { AddressEntity } from '../../benchmark-data/model/address.entity';

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
    const result = await this.prismaService.marketing_campaigns.findMany({
      select: {
        id: true,
        name: true,
        marketingCampaignsOnCustomers: {
          select: {
            customers: {
              select: {
                id: true,
                companyName: true,
                customersAddress: true,
              },
            },
          },
        },
      },
    });

    const reports = result.map((it) => this.mapRowToCampaignReportEntity(it));

    return reports;
  }

  private mapRowToCampaignReportEntity(
    row: Partial<JoinedReport>,
  ): CampaignReportEntity {
    return {
      marketingCampaignId: row.id,
      marketingCampaignName: row.name,
      customers: this.mapCustomerReports(row.marketingCampaignsOnCustomers),
    };
  }

  private mapCustomerReports(
    customers: CustomerContainer[],
  ): CampaignReportCustomerEntity[] {
    return customers.map((customer) => {
      return {
        customerId: customer.customers.id,
        customerName: customer.customers.companyName,
        customerAddress: customer.customers.customersAddress,
      };
    });
  }
}

class JoinedReport {
  id: string;
  name: string;
  marketingCampaignsOnCustomers: CustomerContainer[];
}

class CustomerContainer {
  customers: CustomerReport;
}

class CustomerReport {
  id: string;
  companyName: string;
  customersAddress: AddressEntity;
}
