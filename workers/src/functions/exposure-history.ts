import { Job } from 'bullmq';
import { ApiPromise, WsProvider } from '@polkadot/api';
import moment from 'moment';
import { getExposure, IBlock } from '../chainUtils';

import { Logger, prepareDB } from '../utils'
import { IExposure, IEra } from '../globals';

/**
 * using api.query.staking.activeEra(): IEra;
 * we step back in time and get the exposure for each validator for each era
 */
export default async function exposureHistoryFunction(job: Job) {
  const logger = new Logger(job);
  var { chainId, cohortId, startDate, endDate } = job.data;
  startDate = startDate
    ? moment(startDate) //.format('YYYY-MM-DD HH:mm:ss') 
    : moment().subtract(30, 'days') //.format('YYYY-MM-DD HH:mm:ss');
  endDate = endDate
    ? moment(endDate) //.format('YYYY-MM-DD HH:mm:ss')
    : moment(); //.format('YYYY-MM-DD HH:mm:ss');

  const mongoClient = await prepareDB(job);
  if (!mongoClient) {
    logger.log('Failed to connect to the database');
    return { success: false };
  }

  const BlocksCollection = mongoClient.db('dnd').collection<IBlock>('blocks');
  const ExposuresCollection = mongoClient.db('dnd').collection<IExposure>('exposures');

  const provider = new WsProvider(`wss://rpc.metaspan.io/${chainId}`);
  const api = await ApiPromise.create({ provider, noInitWarn: true });
  await api.isReady;

  const blocks = await BlocksCollection.find({
    chainId,
    dateTime: { $gte: startDate, $lte: endDate }
  }).toArray();
  
  for (const block of blocks) {
    const blockHash = await api.rpc.chain.getBlockHash(block.blockNumber);
    const apiAt = await api.at(blockHash);
    const era = (await apiAt.query.staking.activeEra()).toJSON() as any as IEra;
    const exposure = await getExposure(apiAt as ApiPromise, era, 'stash', logger);
    await ExposuresCollection.updateOne({
      chainId,
      blockNumber: block.blockNumber
    }, { $set: { exposure } }, { upsert: true });

  }

}
