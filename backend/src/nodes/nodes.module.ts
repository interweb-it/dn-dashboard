import { Module } from '@nestjs/common';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { NodesResolver } from './nodes.resolver';
import { NodesService } from './nodes.service';

@Module({
  imports: [],
  providers: [NodesService, NodesResolver, BlockchainService],
  exports: [NodesService, NodesResolver],
})
export class NodesModule {}
