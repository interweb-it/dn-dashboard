import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

if (process.env.NODE_ENV == 'develpment') {
  console.log('process.env.DB_HOST:', process.env.DB_HOST);
  console.log('process.env.DB_PORT:', process.env.DB_PORT);
  console.log('process.env.DB_USER:', process.env.DB_USER);
  console.log('process.env.DB_PASSWORD:', process.env.DB_PASSWORD);
  console.log('process.env.DB_NAME:', process.env.DB_NAME);
  
  console.log('process.env.REDIS_HOST:', process.env.REDIS_HOST);
  console.log('process.env.REDIS_PORT:', process.env.REDIS_PORT);
  console.log('process.env.REDIS_PASSWORD:', process.env.REDIS_PASSWORD);
  
  console.log('process.env.PORT:', process.env.PORT);  
  console.log('process.env.MONGO_URI:', process.env.MONGO_URI);
}
