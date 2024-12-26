import { ParseIntPipe } from '@nestjs/common';
import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { BlockchainService, INominator, IValidator } from './blockchain.service';

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
    @Args('active')
    active: boolean,
  ): Promise<IValidator[]> {
    console.debug('resolver.ts: getValidators', 'chainId', chainId);
    let vals: IValidator[] = [];
    if (active) {
      vals = await this.blockchainService.getSessionValidators(chainId);
    } else {
      vals = await this.blockchainService.getAllValidators(chainId);
    }
    return vals;
  }

  @Query('validator')
  async getValidator(
    @Args('chainId')
    chainId: string,
    @Args('address')
    address: string,
  ): Promise<IValidator> {
    console.debug('resolver.ts: getValidator', 'chainId', chainId, 'address', address);
    const val = await this.blockchainService.getValidator(chainId, address);
    if (!val) {
      return null;
    }
    // check if val is in sessionValidators
    const active = this.blockchainService.getSessionValidators(chainId).find((v) => v.address === address);
    val.active = active ? true : false;
    return val;
  }

  @Query('stakers')
  async getStakers(
    @Args('chainId')
    chainId: string,
  ): Promise<INominator[]> {
    console.debug('resolver.ts: getNominators', 'chainId', chainId);
    const noms = await this.blockchainService.getNominators(chainId);
    return noms;
  }

  @Query('staker')
  async getStaker(
    @Args('chainId')
    chainId: string,
    @Args('address')
    address: string,
  ): Promise<INominator> {
    console.debug('resolver.ts: getStaker', 'chainId', chainId, 'address', address);
    const nom = await this.blockchainService.getNominator(chainId, address);
    return nom;
  }
}
