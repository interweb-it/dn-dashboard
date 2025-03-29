import { Module, forwardRef } from '@nestjs/common';
import { BlockchainResolver } from './blockchain.resolver';
import { BlockchainService } from './blockchain.service';

import { NodesModule } from 'src/nodes/nodes.module';
import { NodesService } from 'src/nodes/nodes.service';
import { TelemetryService } from 'src/telemetry/telemetry.service';

@Module({
  imports: [forwardRef(() => NodesModule)],
  providers: [BlockchainService, BlockchainResolver, NodesService, TelemetryService],
  exports: [BlockchainService, BlockchainResolver],
})
export class BlockchainModule {}
