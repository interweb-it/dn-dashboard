import { Module, forwardRef } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
// import { BlockchainService } from 'src/blockchain/blockchain.service';
import { NodesResolver } from './nodes.resolver';
import { NodesService } from './nodes.service';

import { TelemetryService } from 'src/telemetry/telemetry.service';

@Module({
  imports: [forwardRef(() => BlockchainModule)],
  providers: [NodesService, NodesResolver, TelemetryService],
  exports: [NodesResolver, NodesService],
})
export class NodesModule {}
