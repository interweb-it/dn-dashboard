import { Module, forwardRef } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
// import { BlockchainService } from 'src/blockchain/blockchain.service';
import { NodesResolver } from './nodes.resolver';
import { NodesService } from './nodes.service';

import { TelemetryModule } from 'src/telemetry/telemetry.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [forwardRef(() => BlockchainModule), forwardRef(() => DatabaseModule), forwardRef(() => TelemetryModule)],
  providers: [NodesService, NodesResolver],
  exports: [NodesResolver, NodesService],
})
export class NodesModule {}
