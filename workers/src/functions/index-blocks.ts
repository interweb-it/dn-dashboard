import { Job } from 'bullmq';
import { ApiPromise, WsProvider } from '@polkadot/api';
import moment from 'moment';
import { Logger, prepareDB } from '../utils'
import { getBlockTimestamp, IBlock } from '../chainUtils';

const getLastBlockOfPreviousHour = async (api: ApiPromise, currentBlock: number, currentHour: string) => {
  // Let's search in a window of 600 blocks (approx. 1 hour)
  let low = currentBlock - 600;
  let high = currentBlock;
  let resultBlockNumber = currentBlock;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midHash = await api.rpc.chain.getBlockHash(mid);
    const midTimestamp = await getBlockTimestamp(api, midHash.toString());
    const midHour = moment(midTimestamp).format('YYYY-MM-DD-HH');

    if (midHour < currentHour) {
      resultBlockNumber = mid;
      low = mid + 1; // look for later blocks in previous hour
    } else {
      high = mid - 1; // look earlier
    }
  }

  const resultHash = await api.rpc.chain.getBlockHash(resultBlockNumber);
  const resultTimestamp = await getBlockTimestamp(api, resultHash.toString());
  const formatted = moment(resultTimestamp).format('YYYY-MM-DD HH:mm:ss');

  console.log(`✅ Found block in previous hour:`);
  console.log(`Block #: ${resultBlockNumber}`);
  console.log(`Timestamp: ${formatted}`);
  return { blockNumber: resultBlockNumber, timestamp: resultTimestamp };
}

// find the last block of each hour between startDate and endDate
export default async function indexBlocksFunction(job: Job) {
  let { chainId, startDate, endDate } = job.data;
  const logger = new Logger(job);

  startDate = startDate ? moment(startDate) : moment().subtract(1, 'days');
  endDate = endDate ? moment(endDate) : moment();
  logger.log(`Indexing blocks for ${chainId} from ${startDate.format('YYYY-MM-DD HH:mm:ss')} to ${endDate.format('YYYY-MM-DD HH:mm:ss')}`);

  const mongoClient = await prepareDB(job);
  if (!mongoClient) {
    logger.log('Failed to connect to the database');
    return { success: false };
  }

  const BlockCollection = mongoClient.db('dnd').collection<IBlock>('blocks');
  var highestBlock = await BlockCollection.findOne({ chainId }, { sort: { blockNumber: -1 } });
  if (highestBlock) {
    logger.log(`Highest block: ${highestBlock.blockNumber} ${highestBlock.timestamp}`);
    // return { success: true };
  } else {
    logger.log(`No highest block found, we need to index from the start`);
    highestBlock = { _id: 1 as any, chainId, blockNumber: 0, timestamp: 0, dateTime: moment().subtract(1, 'days').toDate() };
  }
  // if highest block is before startDate, we need to index from the start
  if (moment(highestBlock.dateTime).isBefore(startDate)) {
    logger.log(`Highest block is before startDate, we need to index from the highest block`);
    startDate = moment(highestBlock.dateTime);
  }

  const provider = new WsProvider(`wss://rpc.metaspan.io/${chainId}`);
  const api = await ApiPromise.create({ provider, noInitWarn: true });
  await api.isReady;

  const startDateHour = moment(startDate).format('YYYY-MM-DD-HH');
  const endDateHour = moment(endDate).format('YYYY-MM-DD-HH');

  const latestHash = await api.rpc.chain.getBlockHash();
  const latestBlock = await api.rpc.chain.getBlock(latestHash);
  var latestNumber = latestBlock.block.header.number.toNumber();
  var latestTimestamp = await getBlockTimestamp(api, latestHash.toString());
  var latestHour = moment(latestTimestamp).format('YYYY-MM-DD-HH');

  logger.log(`Latest block: ${latestNumber} ${latestHour} vs start: ${startDateHour} end: ${endDateHour}`);

  while (latestHour >= startDateHour && latestHour <= endDateHour) {
    logger.log(`Indexing blocks for ${latestHour}`);
    const { blockNumber, timestamp } = await getLastBlockOfPreviousHour(api, latestNumber, latestHour);
    await BlockCollection.updateOne({
      chainId,
      blockNumber,
    }, {
      $set: {
      chainId,
      blockNumber,
      timestamp,
      dateTime: moment(timestamp).toDate(), // .utc().format('YYYY-MM-DDTHH:mm:ss.Z'), // UTC timestamp format
    } }, { upsert: true });
    latestNumber = blockNumber;
    latestTimestamp = timestamp;
    latestHour = moment(timestamp).format('YYYY-MM-DD-HH');
  }

  await api.disconnect();
  return { success: true };
}