import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';
import { DatabaseService } from './database.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [...databaseProviders, DatabaseService],
  exports: [...databaseProviders, DatabaseService],
})
export class DatabaseModule {}
