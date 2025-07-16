import { forwardRef, Module } from '@nestjs/common';
import { TelemetryResolver } from './telemetry.resolver';
import { TelemetryService } from './telemetry.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [forwardRef(() => DatabaseModule)],
  providers: [TelemetryService, TelemetryResolver],
  exports: [TelemetryService, TelemetryResolver],
})
export class TelemetryModule {}
