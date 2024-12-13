import { Module } from '@nestjs/common';
import { PerformanceResolver } from './performance.resolver';
import { PerformanceService } from './performance.service';

@Module({
  imports: [],
  providers: [PerformanceService, PerformanceResolver],
  exports: [PerformanceService, PerformanceResolver],
})
export class PerformanceModule {}
