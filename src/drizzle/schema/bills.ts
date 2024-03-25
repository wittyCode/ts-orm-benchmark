import { index, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { defaultUtcNow } from './helpers';
import { relations } from 'drizzle-orm';
import { customers } from './customers';
import { orderedParts } from './ordered-parts';

export const bills = pgTable(
  'bills',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    billNumber: integer('bill_number').notNull(),
    customerId: uuid('customerId').notNull(),

    updatedAtUtc: timestamp('updated_at_utc').notNull().default(defaultUtcNow),
    createdAtUtc: timestamp('created_at_utc').notNull().default(defaultUtcNow),
  },
  (table) => {
    return {
      customerIdIndex: index('bill_customer_id').on(table.customerId),
    };
  },
);

export const billToCustomerRelation = relations(bills, ({ one }) => ({
  customer: one(customers, {
    fields: [bills.customerId],
    references: [customers.id],
    relationName: 'bill_to_customer',
  }),
}));

export const billsToOrderedPartsRelation = relations(bills, ({ many }) => ({
  orderedParts: many(orderedParts, {
    relationName: 'ordered_parts_bill',
  }),
}));
