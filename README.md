# Typescript ORM and SQL Query builder benchmark

## Purpose

To learn typescript, and NestJS by doing, I was looking for a project to implement. While researching what ORMs are used usually in Node.js applications, it became clear that a few options seem viable at first glance, but I was not able to find a comprehensive (and up-to-date) benchmark of their performance. After reading up on real performance problems with a few of them, like Prisma, I decided to build my own benchmark project, to explore, learn and maybe later open-source comprehensive results of benchmarking the different libraries.

I started with Drizzle since there seemed to be a lot of hype around it's performance and simplicity.

Ideally this will enable people to checkout the repo to their machine, configure the database driver they want to be setup against their local or remote database (first step being PostgreSQL since supporting multiple drivers will be more work and I want to finish the different ORMs first)

The goal is not a benchmark with optimized ORM usage - but instead a benchmark with code implemented following tutorials and then applying code tidyings like extracting stuff into methods to improve readability. I do this since this is what I imagine most code to look like: a team learning a new framework/library and using it. When you're more experienced you'll probably be able to optimize - but this is not the scope of this benchmark.
For this I try to balance the time I invest into learning the different frameworks and trying to figure out problems from the documentation and available resources. If a problem COULD be solved with very high effort or with complicating the code too much, I'll probably take the performance hit.

In the long run I want to compare the following libraries, some because they are popular, some because they keep popping up on my radar:

![Libraries to Test](./doc/npmtrends_april2024.png)

## On the shoulders of giants

The idea for this project stemmed from the fact that I could not find a relevant existing benchmark.
I found a theoretically very good benchmark for this in this [repository](https://github.com/emanuelcasco/typescript-orm-benchmark) by Emanuel Casco. The problem here is, that the last update was 4 years ago - in the meantime new frameworks showed up and others got significant updates.
So building on inspiration from the methodology and comparisons there, I decided to start fresh.

Also a lot of this would not have been possible without resources out there to provide guidance on how to solve specific problems. For Drizzle, ["SakuraDev"](https://www.youtube.com/playlist?list=PLhnVDNT5zYN8PLdYddaU3jiZXeOyehhoU) has a great playlist explaining all concepts and showing implementation examples, which might be a little outdated by now but I was easily able to adapt the code to there current API where it was no longer as it is shown in the videos

## Methodology and Data used

To be able to compare the different libraries, we will use the following assumptions, data model and queries:

1. We want to explore every relevant relation type available: 1:1, 1:n, n:m - in the last case by using a join-table between the related entities.
2. In the current iteration we will look into simple use-cases like uuids as primary key and indices only on foreign keys - in a future iteration composite indices or keys could be interesting to explore as well since that will impact insert performance
3. We want a dataset that's sufficiently big, ideally with entities in the millions.
4. We randomize the size of collections of child-entities a bit, to not just have uniform data insertion - since in real production use-cases different sizes of datasets are to be expected.
5. Statistics and the [Law of Large Numbers](https://en.wikipedia.org/wiki/Law_of_large_numbers) will ensure that we have a normal distribution for entity count so that we can still compare between sufficiently large benchmarks
6. We're interested in insertion performance, performance of selecting big datasets and of updating selected columns for big datasets in bulk
7. A report-like query to test how joining multiple tables and grouping performs is in place
8. All data can be easily deleted to also be able to measure bulk deletions
9. Measuring will mean running the benchmark multiple times to get a large enough sample size

A simple synthetic use-case to achieve our goals is the following:

- We own an online store that sells parts for an industry that regularly needs to re-order (e.g. for car mechanics)
- The main parent entity in our shop is the customer. A customer has address details assigned in a 1:1-relation
- Every customer has many Orders (1-n relation) and a bill for each order (1-n from customer to bill)
- Every order consists of many ordered parts (1-n) - this will be the biggest insert we do
- Every ordered part is assigned to a bill (1-n from bill to ordered part) with a big update statement. This is the bulk update we want to explore
- All data for a customer needs to be able to be queried. This is where we should be able to see how big selects perform - ideally also when comparing different limits and offsets
- Our marketing department can create marketing campaigns and roll them out to customers - this is where the many-to-many relation will be in place, a customer can be part of multiple campaigns at the same time and campaigns contain multiple customers.
- A report is generated, that shows all adresses of customers within the marketing campaigns (join customers to their campaigns, join addresses to their customers, group by campaign)

![Data model](doc/data_model.png)

The size of the data needs to be configurable in the environment. The following set of defaults currently seems sensible and is used if no configuration is provided:

- The number of customers is given as parameter when starting the benchmark
- Every customer has an address
- The number of orders is the number of customers multiplied with a factor between 1 and 25
- The number of ordered parts is the number of orders multiplied with a factor between 1 and 10
- The number of bills is equal to the number of orders
- The number of marketing campaigns is the number of customers divided by 100
- The number of customers per marketing campaigns is between 1 and 10

Comparison is done by marking the performance of each database operation and calculating the average, median and 90%-percentile to get meaningful numbers for repeated operations, e.g. chunk inserts/updates

## Dev Setup

Install your dependencies with

```bash
pnpm install
```

You can run either only a postgres db to connect to or a compose setup with a db and dockerized app ( see [Dockerfile](docker/Dockerfile-ts-orm-benchmark) for application container contents)

After your container is up and running, run

```bash
pnpm drizzle-generate
pnpm drizzle-push
```

to generate and apply the database migration scripts to your DB with the drizzle-kit cli

Configure your sizes in the .env file of your repo. The following keys are used:

- ORDER_AMOUNT_FACTOR - max number of orders per customer
- ORDERED_PARTS_FACTOR - max number of ordered parts per order
- MARKETING_CAMPAIGN_DIVISOR - how many marketing campaigns when compared to number of customers
- MARKETING_CAMPAINGS_TO_CUSTOMER_FACTOR - max number of customers that are assigned to one marketing campaign in the joinTable

- CUSTOMER_CHUNK_SIZE chunk size used when chunking inserts of big amounts of customer entities
- ORDER_CHUNK_SIZE chunk size used when chunking inserts of big amounts of order/orderedParts entities
- CAMPAIGNS_CHUNK_SIZE chunk size used when chunking inserts of big amounts of marketingCampaign entities and joinTable entries

## TODOs

a lot.

by order of current priority (subject to change):

1. improve documentation about intent, methodology and configuration
2. do a first comparison of performance between drizzle and prisma now that implementation is done
3. change resetting benchmark from resetting everything to either dropping DB or resetting metrics
4. add count as field for the report join query to check how easy aggregation and projection can be combined (in prisma it seems to just be adding _count https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#relation-count)
5. Check and compare with Prisma experimental feature that actually joins data correctly
6. implement parallelism to be able to simulate multiple clients accessing the db at the same time, at least for READ queries, since that is a more realistic use-case than heavy inserts/updates at the same time - later also parallel inserts can be included
7. updated_at_utc update trigger in drizzle

unordered:

- The current implementation runs into Heapspace memory issues due to the dataset being completely generated in advance and therefore not eligible for garbage collection. We could look into generating test data in chunks as we do for inserting.
- compare performance. keep stuff in mind like running multiple iterations and ordering them by iteration to see if caching helps or if implementations run into worse performance in later runs (e.g. drizzle seemed to actually get faster after a few runs before stabilizing but prisma seemed stable or actually getting slightly worse - but this currently is just anecdotal, do a real test on this) - also compare not only overall performance but look into different query clusters!
- Maybe implement a table with a lot of columns to see how inserts there scale when a lot of columns are involved. also do projection query selcting only a couple of columns to check if some ORMs really have bad performance due to full loads and doing the projection in memory
- add Frontend to actually look at results - this will be a fun project to dive into React, Vite and tailwind-css
- support the following ORMs and query builders:
- centralize the environment configs for database drivers
- split different benchmark functions into separate benchmarks to look into specific things

  typeorm,
  sequelize
  mikro-orm,
  knex,
  kysely,
  objectionjs,
