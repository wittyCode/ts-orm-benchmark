# Prisma ORM Overview

## Setup

Install prisma-orm with the following command:

```bash
pnpm add @prisma/client
```

Tables are defined in prisma/schema.prisma.
Since I started with Drizzle and had an existing database and wanted to try out Prisma features, I generated the prisma schema by running

```bash
npx prisma db pull
```

to populate the schema.prisma file from the existing database. 
Sadly not all relations were created correctly, so manual repair work was needed to get to the intended data model and it's contents.
Maybe it would have been easier to just create the migrations manually instead of trying to pull - because manually checking what went wrong on pull was tedious.

Afterwards the client code needs to be generated:
```bash
npx prisma generate
```
For implementation of inserts and queries, see the Repository implementations in the repository directory.
For inserting across multiple tables transactions need to be used. You can find an example in
the [CustomerPrismaRepository](./repository/customer.prisma.repository.ts)

## Usage

For migration support, install the dev-dependency drizzle-kit:

```bash
pnpm install drizzle-kit
```

Then set up your DB credentials in [drizzle.config.ts](../../drizzle.config.ts) in your project root directory.
You can generate migrations and push them to the DB using the following commands:

```bash
pnpm run drizzle-generate
pnpm run drizzle-push
```

These commands are defined in the [package.json](../../package.json) file, so check there what actually gets called

## Opinion

initial learning curve easier since everything is based on querybuilder with nice syntax;
joins with desired result format hard because (seemingly) no easy way for projections exist - so more mapping functions need to be in place
