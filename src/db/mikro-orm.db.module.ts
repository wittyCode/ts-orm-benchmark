// TODO re-introduce this module and dependecy (version 5.9.3) to package.json
// import { Module, Scope } from '@nestjs/common';
// import { MikroOrmModule, MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
// import { LoggerModule } from '../logger/logger.module';
// import { PostgreSqlDriver } from '@mikro-orm/postgresql';
//
// export const MICRO_ORM_DEFAULT_OPTIONS: MikroOrmModuleSyncOptions = {
//   name: 'ts-orm-benchmark',
//   entities: ['./dist/**/*.entity.js'],
//   entitiesTs: ['./src/**/*.entity.ts'],
//   driver: PostgreSqlDriver,
//   scope: Scope.TRANSIENT,
//   allowGlobalContext: true,
// };
//
// @Module({
//   imports: [
//     MikroOrmModule.forRoot({
//       ...MICRO_ORM_DEFAULT_OPTIONS,
//       dbName: 'postgres',
//       # TODO inject this config from env
//       clientUrl: 'postgresql://postgres:postgres@localhost:5432/postgres',
//       debug: true,
//       logger: console.log.bind(console),
//     }),
//     LoggerModule,
//   ],
//   providers: [],
//   exports: [MikroOrmModule],
// })
// export class MikroOrmDbModule {}
