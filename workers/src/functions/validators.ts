import { Job } from 'bullmq';
import { ApiPromise, WsProvider } from '@polkadot/api';
import '@polkadot/api-augment';
// import '@polkadot/api-augment/polkadot';
import moment from 'moment';
import { getAllValidators, getExposure } from '../chainUtils';

import { Logger, prepareDB } from '../utils'
import { ICohort, IEra } from '../globals';
import { ICohortData } from '@dn/common/dn';

const RPC_URL_POLKADOT = process.env.RPC_URL_POLKADOT || 'wss://rpc.metaspan.io/polkadot';
const RPC_URL_KUSAMA = process.env.RPC_URL_KUSAMA || 'wss://rpc.metaspan.io/kusama';

/**
 * Update validators for a chain / cohort
 * @param job Job
 * @returns {Promise<{ success: boolean }>}
 */
export default async function validatorsFunction(job: Job) {
  var { chainId, cohortId, refDate } = job.data;
  const logger = new Logger(job);
  logger.log(`${chainId.padEnd(10)} validatorsFunction`);
  if (!chainId) {
    logger.log('Missing chainId');
    return { success: false };
  }

  const mongoClient = await prepareDB(job);
  if (!mongoClient) {
    logger.log('Failed to connect to the database');
    return { success: false };
  }
  // ping the DB

  // const CohortsCollection = mongoClient.db('dnd').collection<ICohort>('cohorts');
  const NodesCollection = mongoClient.db('dnd').collection<ICohortData>('nodes');
  const ExposureCollection = mongoClient.db('dnd').collection('exposures');
  const ValidatorCollection = mongoClient.db('dnd').collection('validators');

  const cohorts = [];
  refDate = refDate ?? moment().format('YYYY-MM-DD');
  logger.log(`refDate: ${refDate}`);
  // chainId, cohortId, 
  // const cohort = await CohortCollection.findOne({ chainId, cohortId });
  // if (!cohort) {
  //   logger.log(`No cohort found for ${chainId}, ${cohortId}`);
  //   return { success: false };
  // }
  if (cohortId) {
    cohorts.push(cohortId);
  } else {
    // get active cohorts
    const activeCohorts = await NodesCollection.find({
      'term.start': { $lte: refDate },
      'term.end': { $gt: refDate }
    }).toArray();
    logger.log(`Active cohorts: ${activeCohorts.length}`);
    cohorts.push(...activeCohorts.map((c) => c.cohortId));
  }

  const url = chainId === 'polkadot' ? RPC_URL_POLKADOT : RPC_URL_KUSAMA;
  logger.log(`${chainId.padEnd(10)} RPC_URL: ${url}`);
  // attempt to connect to the RPC URL, if the connection is not ready after 10 seconds, return an error
  const timeout = setTimeout(() => {
    logger.log(`${chainId.padEnd(10)} RPC_URL: ${url} is not ready`);
    return { success: false };
  }, 10000);
  const provider = new WsProvider(url);
  const api = await ApiPromise.create({ provider, noInitWarn: true });
  await api.isReady;
  clearTimeout(timeout);

  for (const cohort of cohorts) {
    const node = await NodesCollection.findOne({ chainId, cohortId: cohort });
    if (!node) {
      logger.log(`No node found for ${chainId}, ${cohort}`);
      return { success: false };
    }

    logger.log(`Getting exposures for ${chainId}...`)

    // const selected = [
    //   {
    //     identity: 'UTSA',
    //     stash: '15wnPRex2QwgWNCMRVSqgqp2syDn8Gf6LPGGabRhA8zoohpt',
    //     status: 'Active',
    //     telemetry: 'UTSA',
    //   },
    //   {
    //     identity: 'VISIONSTAKE 👁‍🗨',
    //     stash: '13Hp4FEF7z7famvakw8cgioHqDxcnhnyQkvd1jF4dxn7cayG',
    //     status: 'Active',
    //     telemetry: null,
    //   },
    // ];

    // use the previous hour
    const dateHour = moment().subtract(1, 'hour').format('YYYY-MM-DD-HH');

    // const era = await api.query.staking.currentEra();
    const era = (await api.query.staking.activeEra()).toJSON() as any as IEra;
    logger.log(`${chainId.padEnd(10)} currentEra: ${era.index}`);

    const allValidators = await getAllValidators(api, logger);

    // for each data.node, update the node exposure
    for (const _node of [...node?.selected, ...node?.backups || []]) {
      const validator = allValidators.find((v) => v.address === _node.stash);
      if (!validator) {
        logger.log(`Validator not found for ${_node.stash}`);
        continue;
      }
      const updatedAt = moment().toDate();
      // logger.log(`getExposure: ${_node.stash} ${JSON.stringify(era.toJSON())}`);
      const exposure = await getExposure(api, era as any, _node.stash, logger);
      await ExposureCollection.updateOne({
        chainId,
        stash: _node.stash,
        dateHour,
      }, { $set: {
        own: exposure.own,
        others: exposure.others.map((o) => ({
          who: o.who,
          value: o.value,
          isDn: node?.nominators?.includes(o.who),
        })),
        active: validator.active,
        blocked: validator.blocked,
        updatedAt,
      } }, { upsert: true });

      const accountData = (await api.query.system.account(_node.stash)).toJSON() as any;
      // const balance = Number(BigInt(accountData.data.free)); // Available balance
      await ValidatorCollection.updateOne({
        chainId,
        stash: _node.stash,
        dateHour,
      }, { $set: {
        active: validator.active,
        blocked: validator.blocked,
        commission: validator.commission,
        account: accountData,
        updatedAt,
        //exposure: exposure, // .others,
        } }, { upsert: true } );
      }
    }
  return { success: true };
}
