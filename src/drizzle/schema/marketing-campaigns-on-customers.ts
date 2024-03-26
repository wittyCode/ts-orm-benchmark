import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { marketingCampaigns } from './marketing-campaigns';
import { customers } from './customers';
import { relations } from 'drizzle-orm';

export const marketingCampaignsOnCustomers = pgTable(
  'marketing_campaigns_on_customers',
  {
    marketingCampaignId: uuid('marketing_campaign_id')
      .notNull()
      .references(() => marketingCampaigns.id),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.customerId, table.marketingCampaignId],
      }),
    };
  },
);

export const marketingCampaignsOnCustomersRelations = relations(
  marketingCampaignsOnCustomers,
  ({ one }) => ({
    customer: one(customers, {
      fields: [marketingCampaignsOnCustomers.customerId],
      references: [customers.id],
    }),
    marketingCampaign: one(marketingCampaigns, {
      fields: [marketingCampaignsOnCustomers.marketingCampaignId],
      references: [marketingCampaigns.id],
    }),
  }),
);
