// import { ParseIntPipe } from '@nestjs/common';
import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
// import { PubSub } from 'graphql-subscriptions';
import { NodesService, INode, INodeBase } from './nodes.service';
export interface ITerm {
  start: string;
  end: string;
}
// const pubSub = new PubSub();

@Resolver('Nodes')
export class NodesResolver {
  constructor(private readonly nodesService: NodesService) {}

  @Query('selected')
  // @UseGuards(NodesGuard)
  async getNodes(
    @Args('chainId')
    chainId: string,
  ): Promise<INode[]> {
    console.debug('resolver.ts: getSelected', chainId);
    return this.nodesService.getSelected(chainId);
  }

  @Query('backups')
  // @UseGuards(NodesGuard)
  async getBackups(
    @Args('chainId')
    chainId: string,
  ): Promise<INodeBase[]> {
    console.debug('resolver.ts: getBackups', chainId);
    return this.nodesService.getBackups(chainId);
  }

  @Query('nominators')
  async getNominators(
    @Args('chainId')
    chainId: string,
  ): Promise<string[]> {
    console.debug('resolver.ts: getNominators', chainId);
    return this.nodesService.getNominators(chainId);
  }

  @Query('term')
  async getTerm(
    @Args('chainId')
    chainId: string,
  ): Promise<ITerm> {
    console.debug('resolver.ts: getTerm', chainId);
    return this.nodesService.getTerm(chainId);
  }

  @Query('nodeByStash')
  async findNodeByName(
    @Args('chainId')
    chainId: string,
    @Args('name')
    name: string,
  ): Promise<INode | INodeBase> {
    console.debug('resolver.ts: findNodeByName', chainId, name);
    return this.nodesService.findNodeByName(chainId, name);
  }

  @Query('nodeByStash')
  async findNodeByStash(
    @Args('chainId')
    chainId: string,
    @Args('stash')
    stash: string,
  ): Promise<INode | INodeBase> {
    console.debug('resolver.ts: findNodeByStash', chainId, stash);
    return this.nodesService.findNodeByStash(chainId, stash);
  }

  // @Query('nodeById')
  // async findOneById(
  //   @Args('chainId')
  //   chainId: string,
  //   @Args('id', ParseIntPipe)
  //   id: number,
  // ): Promise<AddedNodeMessageX> {
  //   console.debug('resolver.ts: findOneById', chainId, id);
  //   return this.nodesService.findOneById(chainId, id);
  // }

  // @Query('nodeByName')
  // async findOneByName(
  //   @Args('chainId')
  //   chainId: string,
  //   @Args('name')
  //   name: string,
  // ): Promise<AddedNodeMessageX> {
  //   console.debug('resolver.ts: findOneByName', chainId, name);
  //   return this.nodesService.findOneByName(chainId, name);
  // }

  // @Query('nodeByNetworkId')
  // async findOneByNetworkId(
  //   @Args('chainId')
  //   chainId: string,
  //   @Args('networkId')
  //   networkId: string,
  // ): Promise<AddedNodeMessageX> {
  //   console.debug('resolver.ts: findOneByName', chainId, networkId);
  //   return this.nodesService.findOneByNetworkId(chainId, networkId);
  // }
}
