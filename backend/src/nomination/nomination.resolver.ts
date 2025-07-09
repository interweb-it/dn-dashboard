import { Logger } from '@nestjs/common';
import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { NominationService } from './nomination.service';
import { INomination } from './nomination.entity';

const logger = new Logger('NominationResolver');

@Resolver('Nomination')
export class NominationResolver {
  constructor(private readonly nominationService: NominationService) {}

  @Query('nominationStats')
  // @UseGuards(TelemetryGuard)
  async getNominationStats(
    @Args('chainId')
    chainId: string,
    @Args('stash')
    stash: string,
  ): Promise<INomination[]> {
    logger.debug(`${chainId.padEnd(10)} getNominationStats ${stash}`);
    return this.nominationService.getNominationStats(chainId, stash) as unknown as INomination[];
  }
}
