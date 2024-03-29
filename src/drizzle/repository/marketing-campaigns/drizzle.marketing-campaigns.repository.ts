import { Inject, Injectable } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../../drizzle.provider';
import * as campaignSchema from '../../schema/marketing-campaigns';
import * as joinTableSchema from '../../schema/marketing-campaigns-on-customers';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BenchmarkMetricsService } from '../../../benchmark-metrics/service/benchmark-metrics.service';
import { MarketingCampaignEntity } from '../../../benchmark-data/model/marketing-campaign.entity';
import { benchmark } from '../../../benchmark-metrics/util/benchmark.helper';
import {
  MarketingCampaignToCustomer,
  MarketingCampaignsRepository,
} from '../../../benchmark-data/repository/marketing-campaigns.repository';

const chunkSize = 1000;

@Injectable()
export class DrizzleMarketingCampaignsRepository
  implements MarketingCampaignsRepository
{
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly drizzle: NodePgDatabase<typeof campaignSchema>,
    private readonly benchmarkMetricsService: BenchmarkMetricsService,
  ) {}
  async upsertManyMarketingCampaigns(
    marketingCampaigns: MarketingCampaignEntity[],
  ): Promise<void> {
    // WARNING: there seems to be an issue with big transaction sizes / many inserts, for 10_000 records it just breaks with
    // bind message has 4464 parameters but 0 parameters or something like that
    // or with "Maximum call stack size exceeded" error
    // TODO: think if this can be parallelized with Promise.all
    // TODO: move  chunkSize to env
    const expectedChunks = Math.ceil(marketingCampaigns.length / chunkSize);
    for (let i = 0; i < marketingCampaigns.length; i += chunkSize) {
      const chunk = marketingCampaigns.slice(i, i + chunkSize);
      await benchmark(
        'DRIZZLE: insert marketing campaign chunks',
        this.upsertManyChunks.bind(this),
        this.benchmarkMetricsService.resultMap,
        chunk,
      );
      console.log(`chunk ${i / chunkSize + 1} of ${expectedChunks} done!`);
    }
  }

  private async upsertManyChunks(
    marketingCampaigns: MarketingCampaignEntity[],
  ): Promise<void> {
    await this.drizzle
      .insert(campaignSchema.marketingCampaigns)
      .values(marketingCampaigns)
      .execute();
  }

  async linkMarketingCampaignsToCustomers(
    marketingCampaignsToCustomer: MarketingCampaignToCustomer[],
  ): Promise<void> {
    const expectedChunks = Math.ceil(
      marketingCampaignsToCustomer.length / chunkSize,
    );
    for (let i = 0; i < marketingCampaignsToCustomer.length; i += chunkSize) {
      const chunk = marketingCampaignsToCustomer.slice(i, i + chunkSize);
      await benchmark(
        'DRIZZLE: insert marketing campaigns to customer relation chunks',
        this.linkChunksOfMarketingCampaignsToCusomters.bind(this),
        this.benchmarkMetricsService.resultMap,
        chunk,
      );
      console.log(`chunk ${i / chunkSize + 1} of ${expectedChunks} done!`);
    }
  }

  async linkChunksOfMarketingCampaignsToCusomters(
    campaignToCustomerChunks: MarketingCampaignToCustomer[],
  ) {
    await this.drizzle
      .insert(joinTableSchema.marketingCampaignsOnCustomers)
      .values(campaignToCustomerChunks)
      .execute();
  }

  async findAll(): Promise<MarketingCampaignEntity[]> {
    return this.drizzle.query.marketingCampaigns.findMany({
      with: {
        customers: true,
      },
    }) as unknown as Promise<MarketingCampaignEntity[]>;
  }

  async drop(): Promise<void> {
    await this.drizzle.delete(campaignSchema.marketingCampaigns).execute();
  }
}
