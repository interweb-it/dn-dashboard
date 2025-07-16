import { ApiPromise, WsProvider } from '@polkadot/api';
import { Logger } from './utils';
import { IExposure, INominator, IValidator, IEra, IExposureOverview, IAccount } from './globals';
import { SignedBlock } from '@polkadot/types/interfaces';

// {"signature":{"signer":{"id":"CaKWz5omakTK7ovp4m3koXrHyHb7NG3Nt7GENHbviByZpKp"},"signature":{"ed25519":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"},"transactionExtensionVersion":0,"era":{"immortalEra":"0x00"},"nonce":0,"tip":0,"mode":0},"method":{"callIndex":"0x0200","args":{"now":1751812986000}}}
export interface IExtrinsic {
  signature: {
    signer: { id: string },
    signature: { ed25519: string },
    transactionExtensionVersion: number,
    era: { immortalEra: string },
    nonce: number,
    tip: number,
    mode: number,
  },
  method: {
    callIndex: string,
    args: any,
  },
}

export interface IBlock {
  chainId: string;
  blockNumber: number;
  timestamp: number;
  dateTime: Date; // string;
}

// export const getBlockTimestamp = (block: SignedBlock): number => {
//   const extrinsic = JSON.parse(block.block.extrinsics[0].toString()) as IExtrinsic;
//   const method = extrinsic.method;
//   const args = method.args;
//   console.log('getBlockTimestamp', block.block.header.number.toNumber(), args.now);
//   return args.now;
// }

// Gets block timestamp (ms) given a block hash
export async function getBlockTimestamp(api: ApiPromise, blockHash: string): Promise<number> {
  const ts = await api.query.timestamp.now.at(blockHash);
  return ts.toNumber();
}

/**
 * Get Session (Active) validators
 * @param api: ApiPromise
 * @returns array of validator addresses
 */
export const getSessionValidators =  async (api: ApiPromise): Promise<string[]> => {
  // https://polkadot.js.org/docs/substrate/storage#validators-vecaccountid32
  const validators = await api.query.session.validators();
  return validators.toJSON() as string[];
}

/**
 * Get exposure for a validator
 * @param api: ApiPromise
 * @param era: IEra
 * @param validatorAddress: string
 * @returns IExposure
 */
export const getExposure = async (api: ApiPromise, era: IEra, validatorAddress: string, logger: Logger): Promise<IExposure> => {
  logger.log(`getExposure: ${validatorAddress} ${era.index}`);
  if (!era) {
    try {
      const _era: IEra = (await api.query.staking.activeEra()).toJSON() as any as IEra;
      era = _era;
      logger.log(`getExposure: index ${era?.index}`);
    } catch (err) {
      logger.log(`getExposure: error ${JSON.stringify(err)}`);
      throw err;
    }
  }
  const exposure: IExposure = {
    chainId: '',
    stash: '',
    dateHour: '',
    own: BigInt(0),
    total: BigInt(0),
    others: [],
  };

  const exposureOverview = (
    await api.query.staking.erasStakersOverview(era.index, validatorAddress)
  ).toJSON() as any as IExposureOverview;
  // staking.erasStakersOverview: Option<SpStakingPagedExposureMetadata>
  // {
  //   total: 8,094,342,343,415,534
  //   own: 144,720,004,207,477
  //   nominatorCount: 1
  //   pageCount: 1
  // }
  exposure.total = BigInt(exposureOverview?.total || 0);
  exposure.own = BigInt(exposureOverview?.own || 0);

  // page through the exposure
  for (let i = 0; i < exposureOverview?.pageCount || 0; i++) {
    const _exposure = (
      await api.query.staking.erasStakersPaged(era.index, validatorAddress, i)
    ).toJSON() as any;
    // staking.erasStakersPaged: Option<SpStakingExposurePage>
    // {
    //   pageTotal: 7,949,622,339,208,057
    //   others: [
    //     {
    //       who: JLENz97TFT2kYaQmyCSEnBsK8VhaDZNmYATfsLCHyLF6Gzu
    //       value: 7,949,622,339,208,057
    //     }
    //   ]
    // }
    exposure.others.push(
      ..._exposure.others.map((o: any) => ({
        who: o.who,
        value: BigInt(o.value),
      })),
    );
  }

  return exposure;
}

/**
 * Get all validators for this session (incl waiting)
 * @param chainId
 * @returns
 */
export const getAllValidators = async (api: ApiPromise, logger: Logger): Promise<IValidator[]> => {
  const allValidators: IValidator[] = [];

  let era: any = await api.query.staking.activeEra();
  era = era ? era.toJSON() : {};

  const sessionValidators = await getSessionValidators(api);

  // https://polkadot.js.org/docs/substrate/storage#validatorsaccountid32-palletstakingvalidatorprefs
  // The map from (wannabe) validator stash key to the preferences of that validator.
  const stakingEntries: any[] = await api.query.staking.validators.entries();
  // this.logger.debug(`${chainId.padEnd(10)} stakingEntries: ${stakingEntries.length}`);
  for (const [key, validatorPrefs] of stakingEntries) {
    try {
      const validatorAddress = key.args[0].toString();
      //const exposure = await getExposure(api, era, validatorAddress);
      // const accountData = (await api.query.system.account(validatorAddress)).toJSON() as any as IAccount;
      // const balance = Number(BigInt(accountData.data.free)); // Available balance
      
      allValidators.push({
        address: validatorAddress,
        // name: validatorPrefs.toJSON().validatorPrefs?.name,
        commission: Number(BigInt(validatorPrefs.toJSON()?.commission)) / 10_000_000,
        blocked: validatorPrefs.toJSON()?.blocked,
        active: sessionValidators.includes(validatorAddress),
        // balance: balance,
        // exposure: {own: BigInt(0), total: BigInt(0), others: []}, // exposure, // .others,
      });
    } catch (err) {
      logger.log(`stakingEntries error: ${JSON.stringify(err)}`);
      continue;
    }
  }
  logger.log(`getAllValidators: ${allValidators.length}`);
  return allValidators;
}

  // getNomsActive = {
  //   kusama: false,
  //   polkadot: false,
  // };

// /**
//  * Get all nominators ~~for DN validators~~
//  */
// export const getAllNominators = async (api: ApiPromise, logger: Logger): Promise<INominator[]> => {
//   logger.log(`getAllNominators`);
//   // Define your GraphQL query
//   const QUERY = gql`
//       query allNominators($chainId: String!, $offset: Int, $limit: Int) {
//         Nominators(chain: $chainId, offset: $offset, limit: $limit) {
//           accountId
//           account {
//             data {
//               feeFrozen
//               free
//               miscFrozen
//             }
//           }
//           targetIds
//         }
//       }
//     `;

//     let hasMore = true;
//     let offset = 0;
//     const limit = 200;

//     while (hasMore) {
//       this.logger.debug(`${chainId.padEnd(10)}, fetching batch ${offset}`);
//       try {
//         // Send the query to the external Apollo server
//         const response = await this.apolloClient.query({
//           query: QUERY,
//           variables: {
//             chainId,
//             offset,
//             limit,
//           },
//         });
//         const batch: any[] = response.data.Nominators;
//         hasMore = batch.length === limit;
//         // Return the data from the response
//         // return response.data;
//         for (const nominator of batch) {
//           this.chains[chainId].nominators.push(nominator);
//         }
//       } catch (error) {
//         // Handle errors as needed
//         console.error('Error fetching blockchain data:', error);
//         hasMore = false;
//         // throw error;
//       } finally {
//         // Increment the offset for the next iteration
//         offset += limit;
//       }
//     }

//     // if (this.getNomsActive[chainId]) {
//     //   this.logger.warn('getAllNominators already running, backing off...');
//     //   return;
//     // }
//     // if (!this.chains[chainId].api) {
//     //   this.logger.warn('api not ready, backing off...');
//     //   return;
//     // }
//     // this.getNomsActive[chainId] = true;

//     // let nominatorEntries: any[] = [];
//     // try {
//     //   nominatorEntries = await this.chains[chainId].api.query.staking.nominators.entries();
//     // } catch (err) {
//     //   this.logger.error('nominatorEntries error', err);
//     //   this.getNomsActive[chainId] = false;
//     //   return;
//     // }
//     // this.logger.debug(`${chainId.padEnd(10)}, nominatorEntries, ${nominatorEntries?.length || 0}`);

//     // this.chains[chainId].nominators = nominatorEntries.map(([key, value]) => {
//     //   const address = key.args[0].toString();
//     //   const targets = value.toJSON().targets;
//     //   return { address, balance: 0, targets };
//     // });

//     // // Extract all nominator addresses
//     // const nominatorAddresses = nominatorEntries.map(([key]) => key.args[0].toString());

//     // // Helper function to process chunks
//     // const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
//     //   const chunks: T[][] = [];
//     //   for (let i = 0; i < array.length; i += chunkSize) {
//     //     chunks.push(array.slice(i, i + chunkSize));
//     //   }
//     //   return chunks;
//     // };

//     // const chunks = chunkArray(nominatorAddresses, 100); // Chunk size of 200
//     // this.logger.debug(`${chainId.padEnd(10)} Processing ${chunks.length} chunks of nominators`);

//     // let chunkIndex = 0;
//     // const _nominators = [];
//     // try {
//     //   for (const chunk of chunks) {
//     //     this.logger.debug(`${chainId.padEnd(10)} processing chunk ${++chunkIndex} of ${chunks.length}`);
//     //     // Batch query for the current chunk
//     //     const accountDataArray = await this.chains[chainId].api.queryMulti(
//     //       chunk.map((address) => [this.chains[chainId].api.query.system.account, address]),
//     //     );

//     //     // Process each account in the chunk
//     //     for (let i = 0; i < chunk.length; i++) {
//     //       const nominatorAddress = chunk[i];
//     //       const accountData = accountDataArray[i].toJSON() as any;

//     //       const balance = Number(
//     //         BigInt(accountData.data.free || 0) +
//     //           BigInt(accountData.data.reserved || 0) +
//     //           BigInt(accountData.data.miscFrozen || 0)
//     //       );

//     //       const stakingEntry = nominatorEntries.find(([key]) => key.args[0].toString() === nominatorAddress);
//     //       const targets = stakingEntry ? stakingEntry[1].toJSON() : { targets: [] };

//     //       _nominators.push({
//     //         address: nominatorAddress,
//     //         balance: balance,
//     //         targets: targets.targets,
//     //       });
//     //     }
//     //   }

//     //   this.logger.log(`${chainId.padEnd(10)} nominators ${_nominators.length}`);
//     //   this.chains[chainId].nominators = _nominators;
//     // } catch (err) {
//     //   this.logger.error('Error processing chunks', err);
//     // } finally {
//     //   this.getNomsActive[chainId] = false;
//     // }
//   }