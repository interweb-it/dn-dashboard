import { Job } from 'bullmq';
import { Logger, prepareDB } from '../utils'
import { INomination, INomStats } from '../entities';
import { ICohort, IExposure } from '../globals';
import moment from 'moment';

/*
export interface INomStats {
  chainId: string;
  stash: string;
  dateHour: string; // YYYY.MM.DD.HH
  active: number;
  commission: number;
  nomDn: number;
  nomNon: number;
  nomValueDn: number;
  nomValueNon: number;
  exposure_dn: number;
  exposure_non: number;
}
*/
function toBigIntSafe(val: string | number | bigint): bigint {
  if (typeof val === 'string') {
    if (val.startsWith('0x') || val.startsWith('0X')) {
      const ret = BigInt(val);
      console.log('toBigIntSafe: hex string', val, ret);
      return ret;
    }
    // fallback: try decimal string
    return BigInt(val);
  }
  return BigInt(val);
}

// calculate the nom_stats for a given chainId and stash
export default async function aggregationFunction(job: Job) {
  var { chainId, stash, refDateHour } = job.data;
  const logger = new Logger(job);

  if (!refDateHour) {
    // if no refDateHour, use the previous hour
    refDateHour = moment().subtract(1, 'hour').format('YYYY-MM-DD-HH');
  }
  const refDate = refDateHour.substring(0, 10); // YYYY-MM-DD

  logger.debug(`${chainId.padEnd(10)} aggregationFunction ${stash} ${refDateHour}`);

  const mongoClient = await prepareDB(job);
  if (!mongoClient) {
    logger.log('Error connecting to MongoDB');
    return { success: false };
  }

  const NodesCollection = mongoClient.db('dnd').collection<ICohort>('nodes');
  const NominationsCollection = mongoClient.db('dnd').collection<INomination>('nominations');
  const ExposuresCollection = mongoClient.db('dnd').collection<IExposure>('exposures');
  const NomStatsCollection = mongoClient.db('dnd').collection<INomStats>('nom_stats');

  const cohort = await NodesCollection.findOne({
    chainId,
    'term.start': { $lte: refDate },
    'term.end': { $gte: refDate }
  });
  if (!cohort) {
    logger.log(`${chainId.padEnd(10)} aggregationFunction ${stash} ${refDateHour} no cohort found`);
    return { success: false };
  }
  logger.log(`${chainId.padEnd(10)} aggregationFunction ${refDateHour} cohort ${cohort.cohortId} found`);

  // const stats: INomStats[] = [];

  for (const selected of cohort.selected) {
    logger.log(`${chainId.padEnd(10)} aggregationFunction ${refDateHour}, cohort ${cohort.cohortId}, stash ${selected.stash}:`);
    const nom_stat: INomStats = {
      chainId,
      stash: selected.stash,
      dateHour: refDateHour,
      //active: nom.active,
      //commission: nom.commission,
      nomDn: 0,
      nomNon: 0,
      nomValueDn: BigInt(0),
      nomValueNon: BigInt(0),
      exposureDn: BigInt(0),
      exposureNon: BigInt(0),
    }
    const nominations = await NominationsCollection.find({ chainId, targetId: selected.stash, dateHour: refDateHour }).toArray();
    logger.log(`${chainId.padEnd(10)} aggregationFunction ${refDateHour}, cohort ${cohort.cohortId}, stash ${selected.stash} found ${nominations.length} nominations`);
    for (const nom of nominations) {
      // console.log(nom)
      if (cohort.nominators?.includes(nom.nominatorId)) {
        nom_stat.nomDn += 1;
        nom_stat.nomValueDn += toBigIntSafe(nom.account.data.free);
      } else {
        nom_stat.nomNon += 1;
        nom_stat.nomValueNon += toBigIntSafe(nom.account.data.free);
      }
    }
    const exposure = await ExposuresCollection.findOne({ chainId, stash: selected.stash, dateHour: refDateHour });
    // console.log(exposure)
    logger.log(`${chainId.padEnd(10)} aggregationFunction stash ${selected.stash}, ${refDateHour}: found ${exposure ? 'exposure' : 'no exposure'}`);
    if (exposure) {
      nom_stat.exposureNon += toBigIntSafe(exposure.own);
      for (const other of exposure.others) {
        if (cohort.nominators?.includes(other.who)) {
          nom_stat.exposureDn += toBigIntSafe(other.value);
        } else {
          nom_stat.exposureNon += toBigIntSafe(other.value);
        }
      }
    }
    console.log(nom_stat)
    // stats.push(nom_stat);
    // console.log('updateOne filter:', { chainId, stash, dateHour: refDateHour });
    await NomStatsCollection.updateOne(
      { chainId, stash: selected.stash, dateHour: refDateHour },
      { $set: nom_stat },
      { upsert: true }
    );
  }

  logger.log(`${chainId.padEnd(10)} aggregationFunction ${stash} ${refDateHour} done`);
  return { success: true };
}
