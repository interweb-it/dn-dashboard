import { Sequelize } from 'sequelize-typescript';
import { Nomination } from 'src/nomination/nomination.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        // dialect: 'mysql',
        // host: 'localhost',
        // port: 3306,
        // username: 'root',
        // password: 'password',
        // database: 'nest',
        dialect: 'sqlite',
        storage: './data/database.sqlite',
        logging: console.log,
      });
      sequelize.addModels([Nomination]);
      await sequelize.sync({
        //force: true, // development only
      });
      return sequelize;
    },
  },
];
