import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { defaultUtcNow } from './helpers';
import { customers } from './customers';

export const customerAddress = pgTable(
  'customers_address',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    country: text('country').notNull(),
    state: text('state'),
    postalCode: text('postalCode').notNull(),
    city: text('city').notNull(),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    address: text('address').notNull(),
    createdAtUtc: timestamp('created_at_utc').notNull().default(defaultUtcNow),
    updatedAtUtc: timestamp('updated_at_utc').notNull().default(defaultUtcNow),
  },
  (table) => {
    return {
      customerIdIndex: index('address_customer_id_index').on(table.customerId),
    };
  },
);
