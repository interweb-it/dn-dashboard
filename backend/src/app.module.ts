import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import {
  BigIntResolver,
  // DateResolver,
  // DateTimeResolver,
} from 'graphql-scalars';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { NodesModule } from './nodes/nodes.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { PerformanceModule } from './performance/performance.module';
import { NominationModule } from './nomination/nomination.module';

import configuration from './config/configuration';
// import { join } from 'path';
// import { upperDirectiveTransformer } from './common/directives/upper-case.directive';
import { databaseProviders } from './database/database.providers';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ScheduleModule.forRoot({}),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      include: [NodesModule, TelemetryModule, BlockchainModule, PerformanceModule, NominationModule],
      // autoSchemaFile: 'schema.gql',
      // autoSchemaFile: join(process.cwd(), 'src/graphql/graphql.schema.gql'),
      // typePaths: ['./**/*.graphql'],
      definitions: {
        // path: join(process.cwd(), 'src/graphql/graphql.schema.ts'),
        customScalarTypeMapping: {
          BigInt: 'bigint',
          DateTime: 'Date',
        },
      },
      resolvers: {
        BigInt: BigIntResolver,
        // DateTime: DateTimeResolver,
        // Date: DateResolver,
      },
      typePaths: ['./**/*.graphql'],
      //transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
      installSubscriptionHandlers: true,
      playground: true, // FIXME
    }),
    NodesModule,
    TelemetryModule,
    BlockchainModule,
    PerformanceModule,
    NominationModule,
  ],
  controllers: [AppController],
  providers: [AppService, ...databaseProviders],
  exports: [...databaseProviders],
})
export class AppModule {}
