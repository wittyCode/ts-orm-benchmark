import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { CustomerStatusEnum } from '../../benchmark-data/model/customer.enums';
import { defaultUtcNow } from './helpers';
import * as ordersSchema from './orders';
import * as adressSchema from './address';
import * as marketingCampaignsOnCustomersSchema from './marketing-campaigns-on-customers';
import { bills } from './bills';

// define as pgEnum for use in schema
export const pgCustomerStatusEnum = pgEnum('customer_status_enum', [
  CustomerStatusEnum.ACTIVE,
  CustomerStatusEnum.INACTIVE,
  CustomerStatusEnum.DELETED,
]);

export const customers = pgTable(
  'customers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyName: text('company_name'),
    status: pgCustomerStatusEnum('customer_status').default(
      CustomerStatusEnum.ACTIVE,
    ),
    createdAtUtc: timestamp('created_at_utc').notNull().default(defaultUtcNow),
    updatedAtUtc: timestamp('updated_at_utc').notNull().default(defaultUtcNow),
  },
  (table) => {
    return {
      organizationNameIndex: index('customers_organization_name_index').on(
        table.companyName,
      ),
    };
  },
);
// TODO: collect all relations in this block instead of having separate blocks! (big learning if this works)
// TODO: look through videos of sakura dev again to check if relations can be simplified!
export const customerRelations = relations(customers, ({ many }) => ({
  customersOrders: many(ordersSchema.orders, {
    relationName: 'customers_orders',
  }),
  marketingCampaigns: many(
    marketingCampaignsOnCustomersSchema.marketingCampaignsOnCustomers,
  ),
  bills: many(bills, {
    relationName: 'bill_to_customer',
  }),
}));

// it looks like the relation needs to be defined in the parent entity
// TODO: check docs if there is an explanation
export const customerAddressRelation = relations(customers, ({ one }) => ({
  address: one(adressSchema.customerAddress, {
    fields: [customers.id],
    references: [adressSchema.customerAddress.customerId],
    relationName: 'customers_address_relation',
  }),
}));
