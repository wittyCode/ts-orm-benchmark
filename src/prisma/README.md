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

to populate the schema.prisma file from the existing database. Sadly not all relations were created correctly.

Afterwards the client code needs to be generated:
```bash
npx prisma generate
```
These schemas must then be used as param in the provider so they are accessible in the application at runtime.
For implementation of inserts and queries, see the Repository implementations in the repository directory.
For inserting across multiple tables transactions need to be used. You can find an example in
the [CustomerDrizzleRepository](./repository/customer/customer.drizzle.repository.ts)

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

Drizzle has a steeper learning curve than some of the alternatives, e.g. Prisma.
Also it does not provide full-fledged type support when using your own entities to improve maintainability by providing
an abstraction from the concrete ORM used. Using the _as_ type assertion helps, but provided me with some instances
where I had to cast to unknown first - maybe there's an easier way, if there is, please tell me!

After the learning curve writing drizzle is actually quite satisfying due to the ability to stay as close to SQL as
possible and therefore automatically learning more about SQL. Somehow only the relations syntax is a bit weird to me, and I always needed to look it up. But maybe that's just me - and when you're used to it, it should definitely become more easy.

I did not find a simple way to update multiple entities in a single transaction, but a few days ago on the official Drizzle docs a workaround/fix was provided by using [Upserts](https://orm.drizzle.team/learn/guides/upsert)
