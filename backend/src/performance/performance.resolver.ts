// import { ParseIntPipe } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { PerformanceService, IPerformance } from './performance.service';

@Resolver('Performance')
export class PerformanceResolver {
  constructor(private readonly performanceService: PerformanceService) {}

  @Query('performance')
  // @UseGuards(PerformanceGuard)
  async getPerformance(
    @Args('chainId')
    chainId: string,
    @Args('address')
    address: string,
    @Args('number_sessions')
    number_sessions: number,
  ): Promise<IPerformance> {
    console.debug('resolver.ts: getPerformance', 'chainId', chainId);
    return this.performanceService.getPerformance(chainId, address, number_sessions || 16);
  }
}
