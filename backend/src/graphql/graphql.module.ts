import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphqlResolver } from './graphql.resolver';
import { TelemetryModule } from '../telemetry/telemetry.module';

@Module({
  imports: [
    TelemetryModule,
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
  ],
  providers: [GraphqlResolver],
})
export class GraphqlModule {}
