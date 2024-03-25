import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { MarketingCampaignEntity } from '../../benchmark-data/model/marketing-campaign.entity';

// TODO: this needs to move to benchmark runner service
export const marketingCampaignDivisorKey = 'MARKETING_CAMPAIGN_DIVISOR';

@Injectable()
export class MarketingCampaignFakerService {
  constructor(private readonly configService: ConfigService) {}

  createMockMarketingCampaigns(maxAmount: number): MarketingCampaignEntity[] {
    const amount = faker.number.int({ min: 1, max: maxAmount });
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
}
