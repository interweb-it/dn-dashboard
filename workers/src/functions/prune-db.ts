import { Job, Queue } from 'bullmq';
import moment from 'moment';

import { Logger, prepareDB } from '../utils'

/**
 * using api.query.staking.activeEra(): IEra;
 * we step back in time and get the exposure for each validator for each era
 */
export default async function pruneDbFunction(job: Job) {
  const { chainId } = job.data;
  const logger = new Logger(job);

  const mongoClient = await prepareDB(job);
  if (!mongoClient) {
    logger.log('Failed to connect to the database');
    return { success: false };
  }

  const NodesCollection = mongoClient.db('dnd').collection('nodes');
  const ValidatorsCollection = mongoClient.db('dnd').collection('validators');
  const NominatorsCollection = mongoClient.db('dnd').collection('nominators');
  const NominationsCollection = mongoClient.db('dnd').collection('nominations');
  const ExposuresCollection = mongoClient.db('dnd').collection('exposures');

  const dateHour = moment().subtract(62, 'days').format('YYYY-MM-DD-HH');
  // delete all nodes for this chain
  let result;
  result = await NodesCollection.deleteMany({ chainId, dateHour: { $lte: dateHour } });
  logger.log(`${chainId}: Deleted ${result.deletedCount} nodes, lte: ${dateHour}`);

  result = await ValidatorsCollection.deleteMany({ chainId, dateHour: { $lte: dateHour } });
  logger.log(`${chainId}: Deleted ${result.deletedCount} validators, lte: ${dateHour}`);

  result = await NominatorsCollection.deleteMany({ chainId, dateHour: { $lte: dateHour } });
  logger.log(`${chainId}: Deleted ${result.deletedCount} nominators, lte: ${dateHour}`);

  result = await NominationsCollection.deleteMany({ chainId, dateHour: { $lte: dateHour } });
  logger.log(`${chainId}: Deleted ${result.deletedCount} nominations, lte: ${dateHour}`);

  result = await ExposuresCollection.deleteMany({ chainId, dateHour: { $lte: dateHour } });
  logger.log(`${chainId}: Deleted ${result.deletedCount} exposures, lte: ${dateHour}`);

  return { success: true };
  
}
