// import { Sequelize } from 'sequelize-typescript';
import { MongoClient } from 'mongodb';
// import { Telemetry } from 'src/telemetry/telemetry.entity';
// import { Nomination } from 'src/nomination/nomination.entity';

export const databaseProviders = [
  {
    provide: 'MONGO_CLIENT',
    useFactory: async () => {
      return new MongoClient(process.env.MONGO_URI);
    },
  },
  // {
  //   provide: 'SEQUELIZE',
  //   useFactory: async () => {
  //     const sequelize = new Sequelize({
  //       dialect: 'mysql',
  //       host: process.env.DB_HOST,
  //       port: parseInt(process.env.DB_PORT),
  //       username: process.env.DB_USER,
  //       password: process.env.DB_PASSWORD,
  //       database: process.env.DB_NAME,
  //       // dialect: 'sqlite',
  //       // storage: './data/database.sqlite',
  //       logging: console.log,
  //     });
  //     sequelize.addModels([Nomination, Telemetry]);
  //     await sequelize.sync({
  //       //force: true, // development only
  //     });
  //     return sequelize;
  //   },
  // },
];
