import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { defaultUtcNow } from './helpers';

export const marketingCampaigns = pgTable('marketing_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),

  createdAtUtc: timestamp('created_at_utc').notNull().default(defaultUtcNow),
  updatedAtUtc: timestamp('updated_at_utc').notNull().default(defaultUtcNow),
});
