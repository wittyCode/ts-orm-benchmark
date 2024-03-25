DO $$ BEGIN
 CREATE TYPE "customer_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'DELETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers_address" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country" text NOT NULL,
	"state" text,
	"postalCode" text NOT NULL,
	"city" text NOT NULL,
	"customer_id" uuid NOT NULL,
	"address" text NOT NULL,
	"created_at_utc" timestamp DEFAULT (now() at time zone 'utc') NOT NULL,
	"updated_at_utc" timestamp DEFAULT (now() at time zone 'utc') NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bill_number" integer NOT NULL,
	"customerId" uuid NOT NULL,
	"updated_at_utc" timestamp DEFAULT (now() at time zone 'utc') NOT NULL,
	"created_at_utc" timestamp DEFAULT (now() at time zone 'utc') NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text,
	"customer_status" "customer_status_enum" DEFAULT 'ACTIVE',
	"created_at_utc" timestamp DEFAULT (now() at time zone 'utc') NOT NULL,
	"updated_at_utc" timestamp DEFAULT (now() at time zone 'utc') NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marketing_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"created_at_utc" timestamp DEFAULT (now() at time zone 'utc') NOT NULL,
	"updated_at_utc" timestamp DEFAULT (now() at time zone 'utc') NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ordered_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"amount" integer NOT NULL,
	"price_per_unit" real NOT NULL,
	"order_id" uuid NOT NULL,
	"bill_id" uuid,
	"updated_at_utc" timestamp DEFAULT (now() at time zone 'utc') NOT NULL,
	"created_at_utc" timestamp DEFAULT (now() at time zone 'utc') NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" integer NOT NULL,
	"order_date" timestamp NOT NULL,
	"customer_id" uuid NOT NULL,
	"updated_at_utc" timestamp DEFAULT (now() at time zone 'utc') NOT NULL,
	"created_at_utc" timestamp DEFAULT (now() at time zone 'utc') NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "address_customer_id_index" ON "customers_address" ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bill_customer_id" ON "bills" ("customerId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customers_organization_name_index" ON "customers" ("company_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ordered_parts_order_index" ON "ordered_parts" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ordered_parts_bill_index" ON "ordered_parts" ("bill_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_customer_id_index" ON "orders" ("customer_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customers_address" ADD CONSTRAINT "customers_address_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ordered_parts" ADD CONSTRAINT "ordered_parts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ordered_parts" ADD CONSTRAINT "ordered_parts_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
