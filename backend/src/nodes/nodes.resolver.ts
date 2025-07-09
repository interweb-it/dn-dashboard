// import { ParseIntPipe } from '@nestjs/common';
import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { NodesService } from './nodes.service';
import { INode, INodeBase, ITerm } from '@dn/common/dn';

@Resolver('Nodes')
export class NodesResolver {
  constructor(private readonly nodesService: NodesService) {}

  @Query('selected')
  async getNodes(
    @Args('chainId')
    chainId: string,
    @Args('cohortId')
    cohortId: string,
  ): Promise<INode[]> {
    console.debug('resolver.ts: getSelected', chainId, cohortId);
    const nodes = await this.nodesService.getSelected(chainId, cohortId);
    return nodes; // .map((node) => node.toJSON() as INode);
  }

  @Query('backups')
  // @UseGuards(NodesGuard)
  async getBackups(
    @Args('chainId')
    chainId: string,
    @Args('cohortId')
    cohortId: string,
  ): Promise<INodeBase[]> {
    console.debug('resolver.ts: getBackups', chainId, cohortId);
    return this.nodesService.getBackups(chainId, cohortId) as unknown as INodeBase[];
  }

  @Query('nominators')
  async getNominators(
    @Args('chainId')
    chainId: string,
    @Args('cohortId')
    cohortId: string,
  ): Promise<string[]> {
    console.debug('resolver.ts: getNominators', chainId, cohortId);
    return this.nodesService.getNominators(chainId, cohortId);
  }

  @Query('term')
  async getTerm(
    @Args('chainId')
    chainId: string,
    @Args('cohortId')
    cohortId: string,
  ): Promise<ITerm> {
    console.debug('resolver.ts: getTerm', chainId, cohortId);
    return this.nodesService.getTerm(chainId, cohortId);
  }

  @Query('nodeByStash')
  async findNodeByName(
    @Args('chainId')
    chainId: string,
    @Args('cohortId')
    cohortId: string,
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
    cohortId: string,
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
