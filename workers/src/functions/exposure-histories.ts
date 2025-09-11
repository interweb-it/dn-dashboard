import { Job, Queue } from 'bullmq';
import { ApiPromise, WsProvider } from '@polkadot/api';
import moment from 'moment';
import { getExposure, IBlock } from '../chainUtils';

import { Logger, prepareDB } from '../utils'
import { ICohort, INodeData } from '../globals';

/**
 * using api.query.staking.activeEra(): IEra;
 * we step back in time and get the exposure for each validator for each era
 */
export default async function exposureHistoriesFunction(job: Job) {
  const { chainId } = job.data;
  const logger = new Logger(job);

  const mongoClient = await prepareDB(job);
  if (!mongoClient) {
    logger.log('Failed to connect to the database');
    return { success: false };
  }

  const CohortsCollection = mongoClient.db('dnd').collection<ICohort>('cohorts');
  const NodesCollection = mongoClient.db('dnd').collection<INodeData>('nodes');

  const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');
  const refDate = moment().format('YYYY-MM-DD HH:mm:ss');

  // find the cohort that is active at the startDate
  const cohorts = await CohortsCollection.find({ 
    chainId, 
    'term.start': { $lte: refDate }, 
    'term.end': { $gte: refDate }
  }).toArray();
  if (cohorts.length === 0) {
    logger.log(`No cohorts found for ${chainId} for ${refDate}`);
    return { success: false };
  }
  logger.log(`Found ${cohorts.length} cohorts for ${chainId} for ${refDate}`);

  const queue = new Queue('exposure-history', {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  });
  
  for (const cohort of cohorts) {
    const node = await NodesCollection.findOne({ chainId, cohortId: cohort.cohortId });
    if (!node) {
      logger.log(`No node found for ${chainId} ${cohort.cohortId}`);
      continue;
    }
    logger.log(`Adding job for ${chainId} ${cohort.cohortId} ${node.selected.length} selected, ${node.backups?.length || 0} backups`);
    for (const item of [...node.selected, ...(node.backups || [])]) {
      // add a job to the queue
      logger.log(`Adding job for ${chainId} ${cohort.cohortId} ${item.stash}`);
      queue.add(`${chainId}-${cohort.cohortId}-${item.stash}`, {
        chainId,
        cohortId: cohort.cohortId,
        // stash: item.stash,
        startDate,
        endDate: refDate,
      });
    }
  }
}
