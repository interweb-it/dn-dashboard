import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { MongoClient } from 'mongodb';

@Injectable()
export class DatabaseService {
  constructor(
    // @Inject('SEQUELIZE')
    // private readonly sequelize: Sequelize,
    @Inject('MONGO_CLIENT')
    private readonly mongoClient: MongoClient,
  ) {}

  // getSequelize(): Sequelize {
  //   return this.sequelize;
  // }

  getMongoClient(): MongoClient {
    return this.mongoClient;
  }
}
