
import { MongoClient } from 'mongodb';


export const databaseProviders = [
  {
    provide: 'MONGO_CLIENT',
    useFactory: async () => {
      // authentication database: admin
      const mongoUri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/admin`;
      //console.log('mongoUri', mongoUri);
      console.log('MONGO_HOST', process.env.MONGO_HOST);
      console.log('MONGO_PORT', process.env.MONGO_PORT);
      console.log('MONGO_USERNAME', process.env.MONGO_USERNAME);
      console.log('MONGO_DATABASE', process.env.MONGO_DATABASE);
      return new MongoClient(mongoUri);
    },
  }
];
