import { sql } from 'drizzle-orm';

export const defaultUtcNow = sql`(now() at time zone 'utc')`;
