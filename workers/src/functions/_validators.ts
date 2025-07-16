// import { Job } from 'bullmq';
// import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
// import moment from 'moment';
// import { Validator } from '../entities';

// const apolloClient = new ApolloClient({
//   uri: 'https://gql.metaspan.io/graphql',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   cache: new InMemoryCache(),
// });

// import { prepareDB } from '../utils'
// /**
//  * Nominations worker
//  */
// export default async function (job: Job) {
//   const { chainId } = job.data;
//   await job.log(`Start processing job: ${chainId}`);
//   const sequelize = await prepareDB(job);

//   // delete validators for chain
//   try {
//     await Validator.destroy({ where: { chainId } });
//   } catch (err) {
//     console.error('Error deleting validators:', err);
//     job.log('Error deleting validators:');
//     job.log(JSON.stringify(err));
//   }

//   await Validator.destroy({ where: { chainId } });

//   job.log(`Getting validators for ${chainId}...`)
//   await _getAllNominators(job, chainId);
//   //job.log(`Found ${_noms.length} nominators`);

//   return { success: true };
// }

// /**
//  * Get all nominators ~~for DN validators~~
//  */
// const _getAllNominators = async function (job: Job, chainId: string) {
//   job.log(`${chainId.padEnd(10)}, getAllNominators`);

//   const QUERY = gql`
//     query validators($chain: String!, $offset: Int, $limit: Int) {
//       Validators(chain: $chain, offset: $offset, limit: $limit) {
//         stash
//         prefs {
//           commission
//         }
//       }
//     }
//   `;

//   let hasMore = true;
//   let offset = 0;
//   const limit = 200;
//   const dateHour = moment().format('YYYY.MM.DD.HH');

//   while (hasMore) {
//     job.log(`${chainId.padEnd(10)}, fetching batch ${offset}`);
//     try {
//       // Send the query to the external Apollo server
//       const response = await apolloClient.query({
//         query: QUERY,
//         variables: {
//           chainId,
//           offset,
//           limit,
//         },
//       });
//       const batch: any[] = response.data.Validators || [];
//       hasMore = batch.length === limit;
//       // add them to the database
//       if (batch.length > 0) {
//         console.log(`adding ${batch.length} nominators to DB`)
//         Validator.bulkCreate(batch.map((val: any) => {
//           return {
//             chainId,
//             stash: val.stash,
//             dateHour, // YYYY.MM.DD.HH
//             active: false,
//             commission: val.prefs.commission,
//             nomDn: 0,
//             nomNon: 0,
//             nomValueDn: 0,
//             nomValueNon: 0,
//             exposure_dn: 0,
//             exposure_non: 0,
//             // balance: Number(BigInt(nom.account.data.free || 0) + BigInt(nom.account.data.reserved || 0) + BigInt(nom.account.data.miscFrozen || 0)),
//             // targets: nom.targetIds,
//           }
//         }, { updateOnDuplicate: ['active', 'commission', 'nomDn', 'nomNon', 'nomValueDn', 'nomValueNon'] }));
//       }

//     } catch (error) {
//       // Handle errors as needed
//       console.error('Error fetching blockchain data:', error);
//       hasMore = false;
//       // throw error;
//     } finally {
//       // Increment the offset for the next iteration
//       offset += limit;
//     }


//   }

// }
