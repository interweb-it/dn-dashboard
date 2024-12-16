// import * as fs from 'fs';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';

export interface IPerformance {
  address: string;
  grade: string;
  authority_inclusion: number;
  para_authority_inclusion: number;
  explicit_votes_total: number;
  implicit_votes_total: number;
  missed_votes_total: number;
  sessions: number[];
}

@Injectable()
export class PerformanceService implements OnModuleInit, OnModuleDestroy {
  // private readonly PERFORMANCE_URL = 'https://${CHAIN_ID}-onet-api.turboflakes.io/api/v1/validators/${ADDRESS}/grade';

  onModuleInit() {}

  onModuleDestroy() {}

  async getPerformance(chainId: string, address: string, number_sessions: number): Promise<IPerformance> {
    console.log('getPerformance', chainId, address);
    let performance: IPerformance | undefined;
    await fetch(
      `https://${chainId}-onet-api.turboflakes.io/api/v1/validators/${address}/grade?number_last_sessions=${number_sessions}&show_sessions=true&show_summary=true`,
    )
      .then((res) => res.json())
      .then((data) => {
        console.log('turboflakes', data);
        performance = data;
      });
    return performance;
  }
}
