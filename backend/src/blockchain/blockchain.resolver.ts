import { ParseIntPipe } from '@nestjs/common';
import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { BlockchainService } from './blockchain.service';

// const pubSub = new PubSub();

@Resolver('Blockchain')
export class BlockchainResolver {
  constructor(private readonly blockchainService: BlockchainService) {}

  // @Query('nodes')
  // // @UseGuards(BlockchainGuard)
  // async getBlockchain(
  //   @Args('chainId')
  //   chainId: string,
  // ): Promise<any[]> {
  //   console.debug('resolver.ts: getBlockchain', 'chainId', chainId);
  //   return [];
  // }

  @Query('validators')
  async getValidators(
    @Args('chainId')
    chainId: string,
  ): Promise<any[]> {
    console.debug('resolver.ts: getValidators', 'chainId', chainId);
    const vals = await this.blockchainService.getValidators(chainId);
    return vals;
  }
}
