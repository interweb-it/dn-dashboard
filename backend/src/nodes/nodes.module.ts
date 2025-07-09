import { Module, forwardRef } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
// import { BlockchainService } from 'src/blockchain/blockchain.service';
import { NodesResolver } from './nodes.resolver';
import { NodesService } from './nodes.service';

import { TelemetryService } from 'src/telemetry/telemetry.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [forwardRef(() => BlockchainModule), forwardRef(() => DatabaseModule)],
  providers: [NodesService, NodesResolver, TelemetryService, DatabaseModule],
  exports: [NodesResolver, NodesService],
})
export class NodesModule {}
