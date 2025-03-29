import { Module } from '@nestjs/common';
import { NominationService } from './nomination.service';
import { NodesModule } from 'src/nodes/nodes.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { nominationProviders } from './nomination.providers';
import { NominationController } from './nomination.controller';
import { DatabaseModule } from 'src/database/database.module';
import { NominationResolver } from './nomination.resolver';
@Module({
  imports: [NodesModule, BlockchainModule, DatabaseModule],
  controllers: [NominationController],
  providers: [NominationService, NominationResolver, ...nominationProviders],
})
export class NominationModule {}
