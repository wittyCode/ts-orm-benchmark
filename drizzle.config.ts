import type { Config } from 'drizzle-kit';

export default {
  schema: './src/drizzle/schema',
  out: './src/drizzle/generated',
  driver: 'pg',
  dbCredentials: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  },
} satisfies Config;
