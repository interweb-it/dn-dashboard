import 'dotenv/config';
// Load environment variables
// import './dot-config';

import { Job, Queue, Worker, FlowProducer } from 'bullmq';
import express from 'express';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import moment from 'moment';

import { prepareDB } from './utils';

// import { startFlow } from './functions/start-flow';
import nodesFunction from './functions/nodes';
import validatorsFunction from './functions/validators';
import nominatorsFunction from './functions/nominators';
import indexBlocksFunction from './functions/index-blocks';
import exposureHistoryFunction from './functions/exposure-history';
import exposureHistoriesFunction from './functions/exposure-histories';
import aggregationFunction from './functions/aggregation';
import pruneDbFunction from './functions/prune-db';

// const chains = [
//   'polkadot',
//   'kusama',
// ];

;(async () => {

  // Redis connection configuration
  const qOpts = {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    }
  };

  const jobRetention = {
    removeOnComplete: {
      age: 24 * 60 *60, // keep up to 24 hour (in millis)
      count: 1000, // keep up to 1000 jobs
    },
    removeOnFail: {
      age: 48 * 60 * 60, // keep up to 48 hours (in millis)
    }
  }

  // const flowQueue = new Queue('flow', qOpts);
  const nodesQueue = new Queue('nodes', qOpts);
  const validatorsQueue = new Queue('validators', qOpts);
  const nominatorsQueue = new Queue('nominators', qOpts);
  const indexBlocksQueue = new Queue('index-blocks', qOpts);
  const exposureHistoryQueue = new Queue('exposure-history', qOpts);
  const exposureHistoriesQueue = new Queue('exposure-histories', qOpts);
  const pruneDbQueue = new Queue('prune-db', qOpts);
  const aggregationQueue = new Queue('aggregation', qOpts);

  const mongoClient = await prepareDB();

  // const flowWorker = new Worker('flow', startFlow, qOpts);
  const nodesWorker = new Worker('nodes', nodesFunction, qOpts);
  const validatorsWorker = new Worker('validators', validatorsFunction, qOpts);
  const nominatorsWorker = new Worker('nominators', nominatorsFunction, qOpts);
  const indexBlocksWorker = new Worker('index-blocks', indexBlocksFunction, qOpts);
  const exposureHistoryWorker = new Worker('exposure-history', exposureHistoryFunction, qOpts);
  const exposureHistoriesWorker = new Worker('exposure-histories', exposureHistoriesFunction, qOpts);
  const pruneDbWorker = new Worker('prune-db', pruneDbFunction, qOpts);
  // const aggregationWorker = new Worker('aggregation', aggregationFunction, qOpts);

  // validatorsQueue.obliterate({ force: true });
  // nodesQueue.obliterate({ force: true });
  // flowQueue.drain();
  validatorsQueue.drain();
  nominatorsQueue.drain();
  indexBlocksQueue.drain();
  exposureHistoryQueue.drain();
  exposureHistoriesQueue.drain();
  pruneDbQueue.drain();
  // aggregationQueue.drain();

  if (0) {
    // flowQueue.obliterate({ force: true });
    nodesQueue.obliterate({ force: true });
    validatorsQueue.obliterate({ force: true });
    nominatorsQueue.obliterate({ force: true });
    indexBlocksQueue.obliterate({ force: true });
    exposureHistoryQueue.obliterate({ force: true });
    exposureHistoriesQueue.obliterate({ force: true });
    pruneDbQueue.obliterate({ force: true });
    // aggregationQueue.obliterate({ force: true });
  }

  const HOUR = 1000 * 60 * 60;
  const TEN_MINUTES = 1000 * 60 * 10;
  const A_VERY_LONG_TIME = 100 * 365 * 24 * 60 * 60 * 1000; // 100 years

  // flowQueue.add('polkadot', { chainId: 'polkadot' }, { repeat: { every: HOUR }, ...jobRetention });
  // flowQueue.add('kusama', { chainId: 'kusama' }, { repeat: { every: HOUR }, ...jobRetention });

  try {
    indexBlocksQueue.add('polkadot', { chainId: 'polkadot' }, { 
      repeat: { pattern: '0 * * * *' // Every hour at minute 0 
    }, ...jobRetention });
    indexBlocksQueue.add('kusama', { chainId: 'kusama' }, { 
      repeat: { pattern: '0 * * * *' // Every hour at minute 0 
    }, ...jobRetention });
  } catch (error) {
    console.error('Error adding index blocks jobs:', error);
  }

  try {
    nodesQueue.add('polkadot', { chainId: 'polkadot' }, { 
      repeat: { pattern: '0 * * * *' // Every hour at minute 0 
    }, ...jobRetention });
    nodesQueue.add('kusama', { chainId: 'kusama' }, { 
      repeat: { pattern: '0 * * * *' // Every hour at minute 0 
    }, ...jobRetention });
  } catch (error) {
    console.error('Error adding nodes jobs:', error);
  }
  // about 1 minute
  try {
    validatorsQueue.add('polkadot', { chainId: 'polkadot' }, { 
      repeat: { pattern: '1 * * * *' // Every hour at minute 1 
    }, ...jobRetention });
    validatorsQueue.add('kusama', { chainId: 'kusama' }, { 
      repeat: { pattern: '1 * * * *' // Every hour at minute 1 
    }, ...jobRetention });
  } catch (error) {
    console.error('Error adding validators jobs:', error);
  }
  // about 20 minutes
  try {
    nominatorsQueue.add('polkadot', { chainId: 'polkadot' }, { 
      repeat: { pattern: '3 * * * *' // Every hour at minute 2 
    }, ...jobRetention });
    nominatorsQueue.add('kusama', { chainId: 'kusama' }, { 
      repeat: { pattern: '3 * * * *' // Every hour at minute 2 
    }, ...jobRetention });
  } catch (error) {
    console.error('Error adding nominators jobs:', error);
  }
  
  // create a flow to 
  // - index blocks for chainId
  // - get validators for chainId
  // - get nominators for chainId
  // - get exposure for chainId
  // - get exposure histories for chainId
  // - get aggregation for polkadot
  // - prune db for polkadot

  try {
    exposureHistoriesQueue.add('polkadot', { chainId: 'polkadot' }, { ...jobRetention, delay: A_VERY_LONG_TIME });
    exposureHistoriesQueue.add('kusama', { chainId: 'kusama' }, { ...jobRetention, delay: A_VERY_LONG_TIME });
  } catch (error) {
    console.error('Error adding exposure histories jobs:', error);
  }

  try {
    pruneDbQueue.add('polkadot', { chainId: 'polkadot' }, { repeat: { every: HOUR }, ...jobRetention });
    pruneDbQueue.add('kusama', { chainId: 'kusama' }, { repeat: { every: HOUR }, ...jobRetention });
  } catch (error) {
    console.error('Error adding prune db jobs:', error);
  }
  
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/ui');

  createBullBoard({
    queues: [
      // new BullMQAdapter(flowQueue, { readOnlyMode: false }),
      new BullMQAdapter(nodesQueue, { readOnlyMode: false }),
      new BullMQAdapter(indexBlocksQueue, { readOnlyMode: false }),
      new BullMQAdapter(validatorsQueue, { readOnlyMode: false }),
      new BullMQAdapter(nominatorsQueue, { readOnlyMode: false }),
      // new BullMQAdapter(aggregationQueue, { readOnlyMode: false }),
      new BullMQAdapter(exposureHistoryQueue, { readOnlyMode: false }),
      // new BullMQAdapter(exposureHistoriesQueue, { readOnlyMode: false }),
      new BullMQAdapter(pruneDbQueue, { readOnlyMode: false })
    ],
    serverAdapter,
  });

  const app = express();
  // redirect / to /ui
  app.get('/', (req, res) => {
    console.log('Redirecting to /ui');
    res.redirect('/ui');
  });

  // log all queries
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
  app.use('/ui', serverAdapter.getRouter());

  // other configurations of your server
    
  app.listen(process.env.PORT || 3005, () => {
    console.log(`Running on ${process.env.PORT || 3005}...`);
    console.log(`For the UI, open http://localhost:${process.env.PORT || 3005}/ui`);
    console.log(`Make sure Redis is running on port ${process.env.REDIS_PORT || 6379}`);
  });

})();
