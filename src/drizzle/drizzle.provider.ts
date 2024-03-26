import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as customersSchema from './schema/customers';
import * as addressSchema from './schema/address';
import * as ordersSchema from './schema/orders';
import * as orderedPartsSchema from './schema/ordered-parts';
import * as billsSchema from './schema/bills';
import * as campaignsSchema from './schema/marketing-campaigns';
import * as marketingCampaignsOnCustomersSchema from './schema/marketing-campaigns-on-customers';

/**
 * ensure the drizzle module can be injected into other modules
 */
export const DrizzleAsyncProvider = 'DRIZZLE_PROVIDER';
export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    useFactory: async () => {
      // TODO use env config with config service (or process.env)
      const client = new Client({
        host: 'localhost',
        user: 'postgres',
        password: 'postgres',
        database: 'postgres',
        port: 5432,
      });
      await client.connect();
      return drizzle(client, {
        schema: {
          ...addressSchema,
          ...customersSchema,
          ...ordersSchema,
          ...orderedPartsSchema,
          ...billsSchema,
          ...campaignsSchema,
          ...marketingCampaignsOnCustomersSchema,
        },
      });
    },
    exports: [DrizzleAsyncProvider],
  },
];
