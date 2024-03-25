import {
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { defaultUtcNow } from './helpers';
import { relations } from 'drizzle-orm';
import { bills } from './bills';

export const orderedParts = pgTable(
  'ordered_parts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    amount: integer('amount').notNull(),
    pricePerUnit: real('price_per_unit').notNull(),

    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, {
        onDelete: 'cascade',
      }),
    billId: uuid('bill_id').references(() => bills.id),

    updatedAtUtc: timestamp('updated_at_utc').notNull().default(defaultUtcNow),
    createdAtUtc: timestamp('created_at_utc').notNull().default(defaultUtcNow),
  },
  (table) => {
    return {
      ordersIndex: index('ordered_parts_order_index').on(table.orderId),
      billIndex: index('ordered_parts_bill_index').on(table.billId),
    };
  },
);

export const orderedPartsOrderRelation = relations(orderedParts, ({ one }) => ({
  order: one(orders, {
    fields: [orderedParts.orderId],
    references: [orders.id],
    relationName: 'order_ordered_parts',
  }),
}));
export const orderedPartsToBillsRelation = relations(
  orderedParts,
  ({ one }) => ({
    bill: one(bills, {
      fields: [orderedParts.billId],
      references: [bills.id],
      relationName: 'ordered_parts_bill',
    }),
  }),
);
