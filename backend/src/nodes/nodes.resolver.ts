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
    @Args('cohortId')
    cohortId: number,
  ): Promise<INode[]> {
    console.debug('resolver.ts: getSelected', chainId, cohortId);
    return this.nodesService.getSelected(chainId, cohortId);
  }

  @Query('backups')
  // @UseGuards(NodesGuard)
  async getBackups(
    @Args('chainId')
    chainId: string,
    @Args('cohortId')
    cohortId: number,
  ): Promise<INodeBase[]> {
    console.debug('resolver.ts: getBackups', chainId, cohortId);
    return this.nodesService.getBackups(chainId, cohortId);
  }

  @Query('nominators')
  async getNominators(
    @Args('chainId')
    chainId: string,
    @Args('cohortId')
    cohortId: number,
  ): Promise<string[]> {
    console.debug('resolver.ts: getNominators', chainId, cohortId);
    return this.nodesService.getNominators(chainId, cohortId);
  }

  @Query('term')
  async getTerm(
    @Args('chainId')
    chainId: string,
    @Args('cohortId')
    cohortId: number,
  ): Promise<ITerm> {
    console.debug('resolver.ts: getTerm', chainId, cohortId);
    return this.nodesService.getTerm(chainId, cohortId);
  }

  @Query('nodeByStash')
  async findNodeByName(
    @Args('chainId')
    chainId: string,
    @Args('cohortId')
    cohortId: number,
    @Args('name')
    name: string,
  ): Promise<INode | INodeBase> {
    console.debug('resolver.ts: findNodeByName', chainId, cohortId, name);
    return this.nodesService.findNodeByName(chainId, cohortId, name);
  }

  @Query('nodeByStash')
  async findNodeByStash(
    @Args('chainId')
    chainId: string,
    @Args('cohortId')
    cohortId: number,
    @Args('stash')
    stash: string,
  ): Promise<INode | INodeBase> {
    console.debug('resolver.ts: findNodeByStash', chainId, cohortId, stash);
    return this.nodesService.findNodeByStash(chainId, cohortId, stash);
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
