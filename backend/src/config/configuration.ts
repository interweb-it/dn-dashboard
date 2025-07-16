// config file
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3002,
  mongo: {
    host: process.env.MONGO_HOST,
    port: parseInt(process.env.MONGO_PORT, 10) || 27017,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    database: process.env.MONGO_DATABASE,
  },
  // database: {
  //   host: process.env.DATABASE_HOST,
  //   port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  // },
});
