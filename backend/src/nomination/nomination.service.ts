import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NodesService } from 'src/nodes/nodes.service';
import { BlockchainService, IValidator } from 'src/blockchain/blockchain.service';
import { format, subDays } from 'date-fns';
import { Nomination, INomination } from './nomination.entity';
import { Op } from 'sequelize';
import { IExposure } from 'src/blockchain/blockchain.service';
import { DatabaseService } from 'src/database/database.service';
import { Collection } from 'mongodb';
import * as moment from 'moment';

// cron interval, default every 30 minutes
// set this in the .env file
const interval = process.env.CRON_NOMINATION_INTERVAL || '*/30 * * * *';

const decimals = {
  polkadot: 10,
  kusama: 12,
}
@Injectable()
export class NominationService {
  // private storageData: StorageData;
  // private storageDataFile: string = './data/storage.json'; // relative to the root of the project
  private readonly nominationsCollection: Collection;
  private readonly validatorsCollection: Collection;
  private readonly logger = new Logger(this.constructor.name.padEnd(18));

  constructor(
    @Inject(forwardRef(() => NodesService))
    private readonly nodesService: NodesService,
    @Inject(forwardRef(() => BlockchainService))
    private readonly blockchainService: BlockchainService,
    @Inject(forwardRef(() => DatabaseService))
    private readonly databaseService: DatabaseService,
  ) {
    this.logger.debug('NominationService constructor');
    this.nominationsCollection = this.databaseService.getMongoClient().db('dnd').collection('nominations');
    this.validatorsCollection = this.databaseService.getMongoClient().db('dnd').collection('validators');
  }

  /**
   * get the nomination stats for a given chainId and stash (validator)
   * @param chainId
   * @param stash
   * @returns array of INomination
   */
  async getNominationStats(chainId: string, stash: string) {
    this.logger.debug(`${chainId.padEnd(10)} getNominationStats ${stash}`);

    // Calculate the cutoff datehour string for 30 days ago
    const cutoffDate = moment().subtract(30, 'days'); // .toDate();
    const cutoffDatehour = cutoffDate.format('YYYY-MM-DD-HH');

    // // search by chainId, stash, datehour (order by datehour desc), limit 1 month
    // const rets = await this.nominationsCollection
    //   .find({ chainId, targetId: stash }, { limit: 30 * 24 })
    //   .sort({ datehour: -1 })
    //   .toArray();
    // if (!rets || rets.length === 0) {
    //   return null;
    // }
    // // const validator = rets[0];

    const nom_stats = await this.nominationsCollection.aggregate([
      // Exclude documents where targetId is empty
      {
        $match: {
          chainId: chainId,
          targetId: stash,
          datehour: { $gte: cutoffDatehour }
        }
      },
      // Convert nominations to INomination structure
      // {
      //   $addFields: {
      //     // decimals: {
      //     //   $switch: {
      //         // branches: [
      //         //   { case: { $eq: ["$chainId", "polkadot"] }, then: 10 },
      //         //   { case: { $eq: ["$chainId", "kusama"] }, then: 12 }
      //         // ],
      //       //   default: 0
      //       // }
      //     // }
      //   }
      // },
      {
        $group: {
          _id: {
            chainId: "$chainId",
            stash: "$targetId",
            datehour: "$datehour"
          },
          decimals: { $first: "$decimals" },
          nom_dn: {
            $sum: { $cond: [{ $eq: ["$isDn", true] }, 1, 0] }
          },
          nom_non: {
            $sum: { $cond: [{ $eq: ["$isDn", false] }, 1, 0] }
          },
          nom_value_dn: {
            $sum: {
              $cond: [
                { $eq: ["$isDn", true] },
                "$account.data.free",
                0
              ]
            }
          },
          nom_value_non: {
            $sum: {
              $cond: [
                { $eq: ["$isDn", false] },
                "$account.data.free",
                0
              ]
            }
          },
          exposure_dn: { $sum: "$exposure_dn" },
          exposure_non: { $sum: "$exposure_non" },
          active: { $first: "$active" },
          commission: { $first: "$commission" }
        }
      },
      {
        $project: {
          _id: 0,
          chainId: "$_id.chainId",
          stash: "$_id.stash",
          datehour: "$_id.datehour",
          // {
          //   $replaceAll: {
          //     input: "$_id.datehour",
          //     find: "-",
          //     replacement: "."
          //   }
          // },
          nom_dn: 1,
          nom_non: 1,
          nom_value_dn: 1, 
          // {
            // $divide: ["$nom_value_dn", { $pow: [10, "$decimals"] }]
          // },
          nom_value_non: 1, 
          // {
          //   $divide: ["$nom_value_non", { $pow: [10, "$decimals"] }]
          // },
          exposure_dn: 1,
          exposure_non: 1,
          active: 1,
          commission: 1
        }
      },
      // Merge with exposure data
      {
        $unionWith: {
          coll: "exposures",
          pipeline: [
            {
              $match: {
                chainId: { $eq: "$chainId" },
                stash: stash,
                datehour: { $gte: cutoffDatehour }
              }
            },
            {
              $addFields: {
                totalOthers: { $sum: "$others.value" }
              }
            },
            {
              $group: {
                _id: {
                  chainId: "$chainId",
                  stash: "$stash",
                  datehour: "$datehour"
                },
                exposure_dn: { $sum: "$exposure_dn" },
                exposure_non: { $sum: "$exposure_non" },
                active: { $first: "$active" },
                commission: { $first: "$commission" },
                nom_dn: { $sum: "$nom_dn" },
                nom_non: { $sum: "$nom_non" },
                nom_value_dn: { $sum: "$nom_value_dn" },
                nom_value_non: { $sum: "$nom_value_non" }
              }
            },
            {
              $project: {
                _id: 0,
                chainId: "$_id.chainId",
                stash: "$_id.stash",
                datehour: "$_id.datehour",
                nom_dn: 1,
                nom_non: 1,
                nom_value_dn: 1,
                nom_value_non: 1,
                exposure_dn: 1,
                exposure_non: 1,
                active: 1,
                commission: 1
              }
            }
          ]
        }
      },
      // Exclude any results where stash is null or empty
      {
        $match: {
          $and: [
            { stash: { $ne: null } },
            { stash: { $ne: "" } }
          ]
        }
      },
      // sort by datehour desc
      {
        $sort: {
          datehour: -1
        }
      }
    ]).toArray();

    console.log(nom_stats.length, 'nom_stats', nom_stats);

    // return ret.map((nom) => ({
    //   ...nom.dataValues,
    //   // force the commission to 2 decimal places and not scientific notation
    //   commission: Number(nom.dataValues.commission.toFixed(2)),
    // }));
    // return {
    //   ...validator,
    //   nom_stats,
    // };
    return nom_stats;
  }
}
