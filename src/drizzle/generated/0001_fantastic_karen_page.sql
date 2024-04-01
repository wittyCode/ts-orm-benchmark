ALTER TABLE "bills" RENAME COLUMN "customerId" TO "customer_id";--> statement-breakpoint
DROP INDEX IF EXISTS "bill_customer_id";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bill_customer_id" ON "bills" ("customer_id");