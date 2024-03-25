import { index, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { customers } from './customers';
import { relations } from 'drizzle-orm';
import { defaultUtcNow } from './helpers';
import { orderedParts } from './ordered-parts';
import { bills } from './bills';

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: integer('order_number').notNull(),
    orderDate: timestamp('order_date').notNull(),

    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id, {
        onDelete: 'cascade',
      }),
    updatedAtUtc: timestamp('updated_at_utc').notNull().default(defaultUtcNow),
    createdAtUtc: timestamp('created_at_utc').notNull().default(defaultUtcNow),
  },
  (table) => {
    return {
      customerIdIndex: index('orders_customer_id_index').on(table.customerId),
    };
  },
);

export const ordersToCustomer = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
    relationName: 'customers_orders',
  }),
}));

export const orderOrderedPartsRelation = relations(orders, ({ many }) => ({
  orderedParts: many(orderedParts, {
    relationName: 'order_ordered_parts',
  }),
}));
