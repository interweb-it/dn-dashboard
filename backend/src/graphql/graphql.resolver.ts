import { Resolver, Query, Args } from '@nestjs/graphql';
import { TelemetryService } from '../telemetry/telemetry.service';
import { Node } from './graphql.schema';

@Resolver()
export class GraphqlResolver {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Query(() => [Node], { name: 'nodes' })
  getNodes(@Args('network') network: string): Node[] {
    return [] //this.telemetryService.getNodes(network);
  }
}
