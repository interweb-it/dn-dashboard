import { Module } from '@nestjs/common';
import { NodesResolver } from './nodes.resolver';
import { NodesService } from './nodes.service';

@Module({
  imports: [],
  providers: [NodesService, NodesResolver],
  exports: [NodesService, NodesResolver],
})
export class NodesModule {}
