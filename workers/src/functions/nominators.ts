import { Job } from 'bullmq';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
import moment from 'moment';
import { INomination, INominator } from '../entities';
import { Logger } from '../utils';

const apolloClient = new ApolloClient({
  uri: 'https://gql.metaspan.io/graphql',
  headers: {
    'Content-Type': 'application/json',
  },
  cache: new InMemoryCache(),
});

import { prepareDB } from '../utils'
/**
 * Nominations worker
 */
export default async function (job: Job) {
  var { chainId, refDateHour } = job.data;

  const logger = new Logger(job);
  logger.log(`nominators: start : ${chainId}, ${refDateHour}`);

  const mongoClient = await prepareDB(job);
  if (!mongoClient) {
    logger.log('Error connecting to MongoDB');
    return { success: false };
  }
  const NodesCollection = mongoClient.db('dnd').collection('nodes');
  const NominatorsCollection = mongoClient.db('dnd').collection<INominator>('nominators');
  const NominationsCollection = mongoClient.db('dnd').collection<INomination>('nominations');

  if (!refDateHour) {
    // if no refDateHour, use the previous hour
    refDateHour = moment().subtract(1, 'hour').format('YYYY-MM-DD-HH');
  }
  const refDate = refDateHour.substring(0, 10); // YYYY-MM-DD

  // get the active cohortId for this chainId, term.start, term.end for today
  const activeCohort = await NodesCollection.findOne({
    chainId,
    'term.start': { $lte: refDate },  // today or earlier
    'term.end': { $gte: refDate },     // today or later
  });
  if (!activeCohort) {
    logger.log(`No active cohort found for ${chainId}`);
    return { success: false };
  }
  console.log('activeCohort', activeCohort);

  const cohortId = activeCohort.cohortId;

  // delete all nominators for this chain and dateHour
  // await NominatorsCollection.deleteMany({ chainId, dateHour });

  job.log(`Getting nominators for ${chainId}...`)
  job.log(`${chainId.padEnd(10)}, getAllNominators`);
  // Define your GraphQL query
  const QUERY = gql`
    query allNominators($chainId: String!, $offset: Int, $limit: Int) {
      Nominators(chain: $chainId, offset: $offset, limit: $limit) {
        accountId
        account {
          data {
            bonded
            feeFrozen
            free
            miscFrozen
            reserved
          }
        }
        targetIds
      }
    }
  `;

  let hasMore = true;
  let offset = 0;
  const limit = 200;

  while (hasMore) {
    logger.debug(`${chainId.padEnd(10)}, fetching batch ${offset}`);
    try {
      // Send the query to the external Apollo server
      // log some performance metrics
      var start = performance.now();
      const response = await apolloClient.query({
        query: QUERY,
        variables: {
          chainId,
          offset,
          limit,
        },
      });
      var end = performance.now();
      logger.debug(`${chainId.padEnd(10)}, fetching batch ${offset} took ${end - start}ms`);
      const batch: any[] = response.data.Nominators;
      hasMore = batch.length === limit;
      // Return the data from the response
      // return response.data;
      start = performance.now();
      for (const nominator of batch) {
        await NominatorsCollection.updateOne({
          chainId,
          dateHour: refDateHour,
          accountId: nominator.accountId,
        }, {
          $set: {
            chainId,
            dateHour: refDateHour,
            ...nominator,
          },
        }, {
          upsert: true,
        });
        const isDn = activeCohort.nominators?.includes(nominator.accountId);
        // console.log(nominator.accountId, 'isDn', isDn);
        // convert account.data to a bigint and convert to number
        const accountData = {
          bonded: Number(BigInt(nominator.account.data.bonded || 0)),
          feeFrozen: Number(BigInt(nominator.account.data.feeFrozen || 0)),
          free: Number(BigInt(nominator.account.data.free || 0)),
          miscFrozen: Number(BigInt(nominator.account.data.miscFrozen || 0)),
          reserved: Number(BigInt(nominator.account.data.reserved || 0)),
        };
        // console.log(nominator.accountId, 'accountData', accountData);
        for (const targetId of nominator.targetIds) {
          // is this a DN nomination?
          await NominationsCollection.updateOne({
            chainId,
            dateHour: refDateHour,
            nominatorId: nominator.accountId,
            targetId,
          }, {
            $set: {
              chainId,
              dateHour: refDateHour,
              targetId,
              nominatorId: nominator.accountId,
              isDn,
              account: { data: accountData },
            },
          }, {
            upsert: true,
          });
        }
      }
      end = performance.now();
      logger.debug(`${chainId.padEnd(10)}, updating ${batch.length} nominators took ${end - start}ms`);
    } catch (error) {
      // Handle errors as needed
      console.error('Error fetching blockchain data:', error);
      hasMore = false;
      // throw error;
    } finally {
      // Increment the offset for the next iteration
      offset += limit;
    }
  } // while (hasMore)

  return { success: true };
}
