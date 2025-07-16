import { Module, forwardRef } from '@nestjs/common';
import { BlockchainResolver } from './blockchain.resolver';
import { BlockchainService } from './blockchain.service';

import { NodesModule } from 'src/nodes/nodes.module';
import { TelemetryModule } from 'src/telemetry/telemetry.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [forwardRef(() => NodesModule), forwardRef(() => DatabaseModule), forwardRef(() => TelemetryModule)],
  providers: [BlockchainService, BlockchainResolver],
  exports: [BlockchainService, BlockchainResolver],
})
export class BlockchainModule {}
