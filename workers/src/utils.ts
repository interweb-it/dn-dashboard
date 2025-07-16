import './dot-config';
import { MongoClient } from 'mongodb';
import { Job } from 'bullmq';

let mongoClient: MongoClient | null = null;
let isConnected = false;
let isConnecting = false;

export class Logger {
  constructor(private job: Job | undefined) {
    this.job = job;
  }
  toString(message: any) {
    if (message instanceof Error) {
      return message.message;
    }
    return JSON.stringify(message);
  }
  // same as console.log
  log(message?: any, ...optionalParams: any[]) {
    console.log(message);
    this.job?.log(this.toString(message));
  }
  debug(message: any) {
    console.debug(message);
    this.job?.log(this.toString(message));
  }
  error(message: string) {
    console.error(message);
    this.job?.log(this.toString(message));
  }
}


export const prepareDB = async (job?: Job): Promise<MongoClient | null> => {
  const logger = new Logger(job);
  if (mongoClient && isConnected) {
    logger.log('DB already connected');
    await mongoClient.db().command({ ping: 1 });
    return mongoClient;
  }

  if (isConnecting) {
    // Wait until the in-progress connection finishes
    logger.log('DB connecting...');
    await new Promise((resolve) => setTimeout(resolve, 100)); // debounce loop
    return prepareDB(job); // retry
  }

  isConnecting = true;
  try {
    if (!mongoClient) {
      logger.log('Creating new MongoClient...');
      mongoClient = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');

      mongoClient.on('close', () => {
        console.warn('===\n\nDB connection closed\n\n===');
        logger.log('DB connection closed');
        isConnected = false;
        mongoClient = null;
      });

      mongoClient.on('error', async (err) => {
        console.error('===\n\nMongoDB error:\n\n===', err);
        logger.log('MongoDB error:');
        logger.log(JSON.stringify(err));
        await mongoClient?.close();
        isConnected = false;
        mongoClient = null;
      });
    }

    logger.log('Connecting to DB...');
    await mongoClient.connect();
    isConnected = true;

    logger.log('DB connected');
    return mongoClient;
  } catch (err) {
    console.error('Unable to connect to MongoDB:', err);
    logger.log('Unable to connect to MongoDB');
    logger.log(JSON.stringify(err));
    isConnected = false;
    mongoClient = null;
    return null;
  }
};


export const closeDB = async () => {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    isConnected = false;
  }
};
