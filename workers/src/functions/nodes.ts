import { Job } from 'bullmq';
import moment from 'moment';
import { ICohortData, INodeBase, INode, NodeStatus, ITerm } from '@dn/common/dn';

import { prepareDB, Logger } from '../utils'
import { ICohort } from '../globals';

const BASE_URL = 'https://nodes.web3.foundation/api/cohort/COHORT_ID/CHAIN_ID';

interface IJobData {
  chainId: string;
  cohortId: string;
}

/**
 * Nodes worker
 */
export default async function (job: Job) {
  let { chainId, cohortId } = job.data;
  const logger = new Logger(job);
  const cohorts: string[] = [];

  logger.log(`Start processing job: ${chainId}`);
  const mongoClient = await prepareDB(job);
  if (!mongoClient) {
    logger.log('Failed to connect to the database');
    return { success: false };
  }
  const CohortCollection = mongoClient.db('dnd').collection<ICohort>('cohorts');

  if (!cohortId) {
    // read from DB
    // get any cohort where term.start is before now and term.end is after now
    const _cohorts = await CohortCollection.find({ chainId }).toArray();
    if (_cohorts.length > 0) {
      _cohorts.forEach(cohort => {
        if (moment(cohort.term?.start).isBefore(moment()) && moment(cohort.term?.end).isAfter(moment())) {
          cohorts.push(cohort.cohortId);
        }
      });
    } else {
      logger.log(`No cohorts found for ${chainId}`);
      return { success: false };
    }
  } else {
    cohorts.push(cohortId);
  }
  logger.log(`Cohorts: ${JSON.stringify(cohorts)}`);

  console.log(`${chainId.padEnd(10)} fetchNodesData`);

  for (const cohortId of cohorts) {
    let data: ICohortData = {
      chainId,
      cohortId,
      backups: [],
      nominators: [],
      selected: [],
      statuses: [] as NodeStatus[],
      term: { start: '', end: '' },
    };
  
    logger.log(`Getting nodes for ${chainId}, ${cohortId}...`)
    try {
      const url = BASE_URL.replace('COHORT_ID', cohortId.toString()).replace('CHAIN_ID', chainId);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data = await response.json();
      logger.log(`${chainId.padEnd(10)} got data selected: ${data.selected?.length || 0}`);
      // update the cohort with the data
      await CohortCollection.updateOne({ chainId, cohortId }, { $set: {
        term: data.term
      } });
    } catch (error) {
      logger.log(`${chainId.padEnd(10)} Failed to fetch data for nodes: ${ JSON.stringify(error) }`);
    }

    // save to DB
    const NodesCollection = mongoClient.db('dnd').collection('nodes');
    // we need chainId, cohortId, and the {data}
    await NodesCollection.updateOne({
      chainId,
      cohortId,
    }, {
      $set: {
        nominators: data.nominators,
        selected: data.selected,
        backups: data.backups,
        statuses: data.statuses,
        term: data.term,
      },
    }, { upsert: true });
  }

  logger.log(`${chainId.padEnd(10)} Nodes data updated`);

  return { success: true };
}
