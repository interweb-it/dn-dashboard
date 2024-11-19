import { Module } from '@nestjs/common';
import { TelemetryResolver } from './telemetry.resolver';
import { TelemetryService } from './telemetry.service';

@Module({
  imports: [],
  providers: [TelemetryService, TelemetryResolver],
  exports: [TelemetryService, TelemetryResolver],
})
export class TelemetryModule {}
