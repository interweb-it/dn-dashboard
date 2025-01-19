import { ParseIntPipe } from '@nestjs/common';
import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
// import { PubSub } from 'graphql-subscriptions';
// import { Node } from '../graphql.schema';
// import { NodeDetailsX } from './telemetry.service';
// import { TelemetryGuard } from './cats.guard';
import { AddedNodeMessageX, NodeDetailsX, TelemetryService } from './telemetry.service';
// import { CreateCatDto } from './dto/create-cat.dto';

// const pubSub = new PubSub();

@Resolver('Telemetry')
export class TelemetryResolver {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Query('telemetry')
  // @UseGuards(TelemetryGuard)
  async getTelemetry(
    @Args('chainId')
    chainId: string,
  ): Promise<AddedNodeMessageX[]> {
    console.debug('resolver.ts: getTelemetry', 'chainId', chainId);
    return this.telemetryService.getNodes(chainId);
  }

  @Query('telemetryForIds')
  // @UseGuards(TelemetryGuard)
  async getTelemetryForIds(
    @Args('chainId')
    chainId: string,
    @Args('ids')
    ids: number[],
  ): Promise<AddedNodeMessageX[]> {
    console.debug('resolver.ts: getTelemetryForIds', 'chainId', chainId, ids);
    const ret = this.telemetryService.getNodes(chainId).filter((node) => ids.includes(node.NodeId));
    // .map((node): AddedNodeMessageX => {
    //   node.IPGeo = this.telemetryService.getGeoForIP(node.NodeDetails.Address);
    //   return node;
    // });
    console.debug('resolver.ts: getTelemetryForIds', 'chainId', chainId, ids, ret);
    return ret;
  }

  @Query('telemetryNames')
  async getTelemetryNames(
    @Args('chainId')
    chainId: string,
  ): Promise<string[]> {
    console.debug('resolver.ts: getTelemetryNames', chainId);
    return this.telemetryService.getNames(chainId);
  }

  // @Query('telemetryForNode')
  // async findOneByNameOrStash(
  //   @Args('chainId')
  //   chainId: string,
  //   @Args('name')
  //   stash: string,
  //   @Args('name')
  //   name: string,
  // ): Promise<AddedNodeMessageX> {
  //   console.debug('resolver.ts: findOneByNameOrStash', chainId, stash, name);
  //   let node: AddedNodeMessageX;
  //   node = this.telemetryService.findOneByName(chainId, name);
  //   if (!node) {
  //     node = this.telemetryService.findOneByStash(chainId, stash);
  //   }
  //   return node;
  // }

  // @Query('telemetryById')
  // async findOneById(
  //   @Args('chainId')
  //   chainId: string,
  //   @Args('id', ParseIntPipe)
  //   id: number,
  // ): Promise<AddedNodeMessageX> {
  //   console.debug('resolver.ts: findOneById', chainId, id);
  //   return this.telemetryService.findOneById(chainId, id);
  // }

  @Query('telemetryByName')
  async findOneByName(
    @Args('chainId')
    chainId: string,
    @Args('name')
    name: string,
  ): Promise<AddedNodeMessageX> {
    console.debug('telemetry.resolver.ts: findOneByName', chainId, `|${name}|`);
    const node = this.telemetryService.findOneByName(chainId, name);
    // console.log('telemetryByName: ', node?.NodeDetails?.ChainStats);
    return node;
  }

  @Query('telemetryByNetworkId')
  async findOneByNetworkId(
    @Args('chainId')
    chainId: string,
    @Args('networkId')
    networkId: string,
  ): Promise<AddedNodeMessageX> {
    console.debug('resolver.ts: findOneByName', chainId, networkId);
    return this.telemetryService.findOneByNetworkId(chainId, networkId);
  }

  @Query('telemetryNameMap')
  async getNameMap(
    @Args('chainId')
    chainId: string,
  ): Promise<Record<string, string>[]> {
    console.debug('resolver.ts: getNameMap', chainId);
    const _map = this.telemetryService.telemetryNameMap(chainId);
    console.log(_map);
    return Object.entries(_map).map(([key, value]) => {
      return {
        dnIdentity: key,
        telemetryName: value,
      };
    });
  }
}
