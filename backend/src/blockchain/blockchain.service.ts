import { Logger, Injectable, Inject, OnModuleInit, OnModuleDestroy, forwardRef } from '@nestjs/common';
// import { ApiPromise, WsProvider } from '@polkadot/api';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
import { Collection, MongoClient } from 'mongodb';
// import moment from 'moment';

import { NodesService } from 'src/nodes/nodes.service';
import { DatabaseService } from 'src/database/database.service';
import * as moment from 'moment';

export interface INominator {
  address: string;
  balance: number;
  targets: string[];
}
export interface IExposureOther {
  who: string;
  value: bigint;
  isDn?: boolean;
}
export interface IExposure {
  stash: string;
  dateHour: string;
  own: bigint;
  total: bigint;
  others: IExposureOther[];
}
export interface IValidator {
  address: string;
  identity?: string;
  commission: number;
  balance: number;
  exposure: IExposure; // should be an array of IExposure?
  active?: boolean;
}

interface IChainState {
  chainHash: string;
  api: any;
  wss_url: string;
  subscription: any;
  session: number;
  sessionValidators: string[]; // session validators and exposures?
  allValidators: IValidator[]; // all validators
  nominators: INominator[]; // staker, account and targets
}

export interface IValidatorStats {
  chainId: string;
  address: string;
  dateHour: string;
  active: boolean;
  blocked: boolean;
  nomValueDn: bigint;
  nomValueNon: bigint;
  exposureDn: bigint;
  exposureNon: bigint;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name.padEnd(18));
  private readonly apolloClient: ApolloClient<any>;
  private readonly mongoClient: MongoClient;

  private readonly nodesCollection: Collection;
  private readonly validatorsCollection: Collection;
  private readonly nominatorsCollection: Collection;
  private readonly nominationsCollection: Collection;
  private readonly exposuresCollection: Collection<IExposure>;
  private readonly exposureHistoriesCollection: Collection;
  private readonly validatorStatsCollection: Collection;

  private chains: Record<string, IChainState> = {
    kusama: {
      chainHash: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
      api: null,
      wss_url: 'ws://192.168.1.92:40425', // DEV
      // wss_url: 'ws://192.168.10.92:40425', // boot
      subscription: null,
      session: 0,
      sessionValidators: [],
      allValidators: [],
      nominators: [],
    },
    polkadot: {
      chainHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
      api: null,
      wss_url: 'ws://192.168.1.92:30325', // DEV
      subscription: null,
      session: 0,
      sessionValidators: [],
      allValidators: [],
      nominators: [],
    },
  };
  // private readonly WSS_BASE_URL = 'wss://rpc.ibp.network/';
  private readonly WSS_BASE_URL = 'wss://rpc.metaspan.io/';

  constructor(
    @Inject(forwardRef(() => NodesService))
    private readonly nodesService: NodesService,
    @Inject(forwardRef(() => DatabaseService))
    private readonly databaseService: DatabaseService,
  ) {
    this.apolloClient = new ApolloClient({
      uri: 'https://gql.metaspan.io/graphql',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: new InMemoryCache(),
    });
    this.mongoClient = this.databaseService.getMongoClient();
    this.nodesCollection = this.mongoClient.db('dnd').collection('nodes');
    this.validatorsCollection = this.mongoClient.db('dnd').collection('validators');
    this.nominatorsCollection = this.mongoClient.db('dnd').collection('nominators');
    this.nominationsCollection = this.mongoClient.db('dnd').collection('nominations');
    this.exposuresCollection = this.mongoClient.db('dnd').collection('exposures');
    this.exposureHistoriesCollection = this.mongoClient.db('dnd').collection('exposure_histories');
    this.validatorStatsCollection = this.mongoClient.db('dnd').collection('nom_stats');
  }

  /**
   * Get all session validators
   * @param chainId
   * @returns array of IValidator
   */
  async getSessionValidators(chainId: string): Promise<IValidator[]> {
    this.logger.debug(`${chainId.padEnd(10)} getSessionValidators`);
    // console.log('this.chains[chainId].sessionValidators', this.chains[chainId].sessionValidators);
    const sessionValidators = await this.validatorsCollection.find({ chainId, active: true }).toArray();
    return sessionValidators.map((val) => {
      return {
        address: val.address,
        identity: val.identity,
        commission: val.commission,
        balance: val.balance,
        exposure: val.exposure,
      };
    });
  }

  /**
   * get all validators
   * @param chainId
   * @returns array of IValidator
   */
  async getAllValidators(chainId: string): Promise<IValidator[]> {
    this.logger.debug(`${chainId.padEnd(10)} getAllValidators`);
    const validators = await this.validatorsCollection.find({ chainId }).toArray();
    return validators.map((val) => {
      return {
        address: val.address,
        identity: val.identity,
        commission: val.commission,
        balance: val.balance,
        exposure: val.exposure,
      };
    });
  }

  /**
   * Get Validator
   * @param chainId
   * @param address
   * @returns
   */
  async getValidator(chainId: string, address: string): Promise<IValidator> {
    this.logger.debug(`${chainId.padEnd(10)} getValidator, ${address}`);
    const val = await this.validatorsCollection.findOne({ chainId, address });
    return {
      address: val.address,
      identity: val.identity,
      commission: val.commission,
      balance: val.balance,
      exposure: val.exposure,
    };
  }

  /**
   * returns all nominators for this chain
   * @param chainId
   * @returns array of INominator
   */
  async getNominators(chainId: string): Promise<INominator[]> {
    this.logger.debug(`${chainId.padEnd(10)} getNominators`);
    const nominators = await this.nominatorsCollection.find({ chainId }).toArray();
    return nominators.map((nom) => {
      return {
        address: nom.address,
        balance: nom.balance,
        targets: nom.targets,
      };
    });
  }

  /**
   *
   * @param chainId
   * @param address
   * @returns
   */
  async getNominator(chainId: string, address: string): Promise<INominator> {
    this.logger.debug(`${chainId.padEnd(10)} getNominator, ${address}`);
    const nom = await this.nominatorsCollection.findOne({ chainId, address });
    return {
      address: nom.address,
      balance: nom.balance,
      targets: nom.targets,
    };
  }

  /**
   * @param chainId
   * @param address
   * @returns
   */
  async getExposure(chainId: string, address: string): Promise<IExposure> {
    this.logger.debug(`${chainId.padEnd(10)} getExposure, ${address}`);
    const exposure = await this.exposuresCollection.findOne({ chainId, address });
    return exposure;
  }

  async getExposureStats(chainId: string, stash: string): Promise<IValidatorStats[]> {
    this.logger.debug(`${chainId.padEnd(10)} getExposureStats, ${stash}`);
    const stats = await this.exposuresCollection.aggregate([
      {
        $match: {
          chainId: chainId,
          stash: stash
        }
      },
      // sort and limit to 24*7*4.333
      { $sort: { dateHour: -1 } },
      { $limit: Math.floor(24*7*4.333) },
      {
        $project: {
          chainId: 1,
          stash: 1,
          dateHour: 1,
          exposureDn: {
            $reduce: {
              input: {
                $filter: {
                  input: "$others",
                  as: "o",
                  cond: { $eq: ["$$o.isDn", true] }
                }
              },
              initialValue: Number(0),
              in: { $add: ["$$value", "$$this.value"] }
            }
          },
          exposureNon: {
            $reduce: {
              input: {
                $filter: {
                  input: "$others",
                  as: "o",
                  cond: {
                    $or: [
                      { $eq: ["$$o.isDn", false] },
                      { $not: ["$$o.isDn"] }
                    ]
                  }
                }
              },
              initialValue: Number(0),
              in: { $add: ["$$value", "$$this.value"] }
            }
          }
        }
      }
    ]).toArray();
    return stats as unknown as IValidatorStats[];
  }

  /**
   * get the nominations for a stash
   * @param chainId
   * @param stash
   * @returns
   */
  async getNominationsForStash(chainId: string, stash: string): Promise<INominator[]> {
    this.logger.debug(`${chainId.padEnd(10)} getNominationsForStash, ${stash}`);

    const dateHour = moment().subtract(1, 'hour').format('YYYY-MM-DD-HH');

    // // query by chainId, accountId (validator address), sort by datehour, decending, take the latest
    // const datehours = await this.nominationsCollection
    //   .find({ chainId, targetId: stash, dateHour })
    //   .sort({ datehour: -1 })
    //   .limit(1)
    //   .toArray();
    // if (datehours.length === 0) {
    //   this.logger.warn(`${chainId.padEnd(10)} getNominationsForStash, datehours for ${stash} not found`);
    //   return [];
    // }
    // const datehour = datehours[0].datehour;
    const nominations = await this.nominationsCollection.find({ chainId, targetId: stash, dateHour }).toArray();
    return nominations.map((nom) => {
      return {
        address: nom.nominatorId,
        balance: Number(
          BigInt(nom.account.data.free || 0) +
            BigInt(nom.account.data.reserved || 0) +
            BigInt(nom.account.data.miscFrozen || 0) +
            BigInt(nom.account.data.feeFrozen || 0) +
            BigInt(nom.account.data.bonded || 0),
        ),
        targets: nom.targets,
      };
    });
  }

  async getNominationStats(chainId: string, stash: string): Promise<IValidatorStats[]> {
    this.logger.debug(`${chainId.padEnd(10)} getNominationStats, ${stash}`);

    const stats = await this.nominationsCollection.aggregate([
      {
        $match: {
          account: { $ne: null },
          "account.data.free": { $ne: null },
          "targetId": stash
        }
      },
      // sort and limit to 24*7*4.333
      { $sort: { dateHour: -1 } },
      { $limit: Math.floor(24*7*4.333) },
      {
        $group: {
          _id: {
            chainId: "$chainId",
            stash: "$targetId",
            dateHour: "$dateHour"
          },
          nomDn: {
            $sum: {
              $cond: ["$isDn", 1, 0]
            }
          },
          nomNon: {
            $sum: {
              $cond: ["$isDn", 0, 1]
            }
          },
          nomValueDn: {
            $sum: {
              $cond: ["$isDn", "$account.data.free", 0]
            }
          },
          nomValueNon: {
            $sum: {
              $cond: ["$isDn", 0, "$account.data.free"]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          chainId: "$_id.chainId",
          stash: "$_id.stash",
          dateHour: "$_id.dateHour",
          nomDn: 1,
          nomNon: 1,
          nomValueDn: { $toLong: "$nomValueDn" },   // If needed
          nomValueNon: { $toLong: "$nomValueNon" }  // If needed
        }
      }
    ]).toArray();
    return stats as unknown as IValidatorStats[];
  }
}
