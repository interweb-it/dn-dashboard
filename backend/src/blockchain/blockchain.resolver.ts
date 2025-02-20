import { ParseIntPipe, Logger } from '@nestjs/common';
import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { BlockchainService, INominator, IValidator } from './blockchain.service';

const logger = new Logger('BlockchainResolver'.padEnd(17));
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
  //   logger.debug('resolver.ts: getBlockchain', 'chainId', chainId);
  //   return [];
  // }

  @Query('validators')
  async getValidators(
    @Args('chainId')
    chainId: string,
    @Args('active')
    active: boolean,
  ): Promise<IValidator[]> {
    logger.debug(`getValidators ${chainId}`);
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
    logger.debug(`${chainId.padEnd(10)} getValidator ${address}`);
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
    logger.debug(`${chainId.padEnd(10)} getNominators`);
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
    logger.debug(`${chainId.padEnd(10)} getStaker ${address}`);
    const nom = await this.blockchainService.getNominator(chainId, address);
    return nom;
  }

  @Query('stakersForStash')
  async getStakersForStash(
    @Args('chainId')
    chainId: string,
    @Args('stash')
    stash: string,
  ): Promise<INominator[]> {
    logger.debug(`${chainId.padEnd(10)} getStakersForStash ${stash}`);
    const noms = await this.blockchainService.getNominatorsForStash(chainId, stash);
    return noms;
  }
}
