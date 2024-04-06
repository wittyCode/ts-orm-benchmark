import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MarketingCampaignEntity } from '../../benchmark-data/model/marketing-campaign.entity';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';
import { MarketingCampaignToCustomer } from '../../benchmark-data/repository/marketing-campaigns.repository';

@Injectable()
export class MarketingCampaignFakerService {
  constructor() {}

  createMockMarketingCampaigns(amount: number): MarketingCampaignEntity[] {
    const result: MarketingCampaignEntity[] = [];
    for (let i = 0; i < amount; i++) {
      result.push(this.createRandomMarketingCampaign());
    }
    return result;
  }

  createRandomMarketingCampaign(): MarketingCampaignEntity {
    const id = uuid();
    return {
      id,
      name: faker.lorem.words({ min: 2, max: 5 }),
      startDate: faker.date.past(),
      endDate: faker.date.future(),
    };
  }

  createRandomlyLinkedCampaignsToCustomers(
    marketingCampaigns: MarketingCampaignEntity[],
    customers: CustomerEntity[],
    maxAmount: number,
  ): MarketingCampaignToCustomer[] {
    const campaignIds = marketingCampaigns.map((it) => it.id);
    const customerIds = customers.map((it) => it.id);

    return campaignIds
      .map((it) =>
        this.assignCampaignIdToMultipleCustomerIds(
          it,
          this.createRandomSizedArrayOfIds(customerIds, maxAmount),
        ),
      )
      .flat();
  }

  private createRandomSizedArrayOfIds(
    customerIds: string[],
    maxAmount: number,
  ) {
    return faker.helpers.arrayElements(customerIds, { min: 1, max: maxAmount });
  }

  private assignCampaignIdToMultipleCustomerIds(
    campaignId: string,
    customerIds: string[],
  ): MarketingCampaignToCustomer[] {
    return customerIds.map((it) => {
      return { marketingCampaignId: campaignId, customerId: it };
    });
  }
}
