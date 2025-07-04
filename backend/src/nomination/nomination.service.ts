import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NodesService } from 'src/nodes/nodes.service';
import { BlockchainService, IValidator } from 'src/blockchain/blockchain.service';
import { format, subDays } from 'date-fns';
import { Nomination, INomination } from './nomination.entity';
import { Op } from 'sequelize';
import { IExposure } from 'src/blockchain/blockchain.service';

const logger = new Logger('NominationService');

// cron interval, default every 30 minutes
// set this in the .env file
const interval = process.env.CRON_NOMINATION_INTERVAL || '*/30 * * * *';

// interface IValidator {
//   stash: string;
//   data: Nomination[];
// }

// interface StorageData {
//   kusama: Record<string, IValidator>;
//   polkadot: Record<string, IValidator>;
// }
const chainIds = ['kusama', 'polkadot'];
// const cohortIds = [1, 2];
const currentCohortId = '2-1';

@Injectable()
export class NominationService {
  // private storageData: StorageData;
  // private storageDataFile: string = './data/storage.json'; // relative to the root of the project

  constructor(
    @Inject(forwardRef(() => NodesService))
    private readonly nodesService: NodesService,
    @Inject(forwardRef(() => BlockchainService))
    private readonly blockchainService: BlockchainService,
    @Inject('NOMINATION_REPOSITORY')
    private nominationRepository: typeof Nomination,
  ) {
    logger.debug('NominationService constructor');
  }

  onModuleInit() {
    logger.debug('NominationService onModuleInit');
    this.handleInterval();
  }

  /**
   * get nominators from nodesService, and get balances from blockchainService
   * calculate the DN/non-DN nominations
   */
  async getDataForStorage() {
    logger.debug(`${'chainId'.padEnd(10)} Updating storage data`);
    for (const chainId of chainIds) {
      logger.debug(`${chainId.padEnd(10)} Getting data for ${chainId}`);
      const vals = await this.blockchainService.getSessionValidators(chainId);
      logger.debug(`${chainId.padEnd(10)} ${chainId} has ${vals.length} validators`);
      let batchArray: INomination[] = [];
      for (const val of vals) {
        const _validator: IValidator = this.blockchainService.getValidator(chainId, val.address);
        const dn_noms = await this.nodesService.getNominators(chainId, currentCohortId);

        // const exposure: IExposure = this.blockchainService.getExposure(chainId, val.address);
        const exposure: IExposure = _validator.exposure;
        //console.debug('exposure', exposure);

        const noms = await this.blockchainService.getNominatorsForStashX(chainId, val.address);
        const data: INomination = {
          chainId: chainId,
          stash: val.address,
          datehour: format(new Date(), 'yyyy.MM.dd.HH'), // YYYY.MM.DD.HH
          active: val.active ? 1 : 0,
          commission: val.commission,

          nom_dn: noms.filter((nom) => dn_noms.includes(nom.address)).length,
          nom_non: noms.filter((nom) => !dn_noms.includes(nom.address)).length,

          nom_value_dn: noms.filter((nom) => dn_noms.includes(nom.address)).reduce((acc, nom) => acc + nom.balance, 0),
          nom_value_non: noms
            .filter((nom) => !dn_noms.includes(nom.address))
            .reduce((acc, nom) => acc + nom.balance, 0),

          exposure_dn:
            exposure.others
              ?.filter((other) => dn_noms.includes(other.who))
              .reduce((acc, other) => acc + Number(other.value), 0) || 0,
          exposure_non:
            exposure.others
              ?.filter((other) => !dn_noms.includes(other.who))
              .reduce((acc, other) => acc + Number(other.value), 0) || 0,
        };
        // this.storeNomination(chainId, data);
        batchArray.push(data);
        if (batchArray.length >= 10) {
          await this.storeNominationsToDB(chainId, batchArray);
          batchArray = [];
        }
      }
      if (batchArray.length > 0) {
        await this.storeNominationsToDB(chainId, batchArray);
      }
    }
  }

  /**
   * store the nomination Stats for chainId : data.stash
   * key: chainId, stash, datehour
   */
  async storeNominationsToDB(chainId: string, data: INomination[]) {
    logger.debug('Storing nomination to DB');
    // upsert the data
    await this.nominationRepository.bulkCreate(
      data.map((d) => ({ ...d, chainId })),
      {
        // upsertKeys: ['chainId', ''],
        updateOnDuplicate: ['active', 'commission', 'nom_dn', 'nom_non', 'exposure_dn', 'exposure_non'],
      },
    );
  }

  // storage calcuation: 2000 validators, 30 days, 24 hours per day
  // 2000 * 30 * 24 = 144_000 rows
  // 144_000 rows * 100 bytes = 14.4 MB
  // trim the storage
  async trimStorage(period = 30) {
    // delete all data older than period days
    const startDate = subDays(new Date(), period);
    const dateHour = format(startDate, 'yyyy.MM.dd.HH');
    logger.debug(`Trimming storage for ${dateHour}`);
    await this.nominationRepository.destroy({
      where: {
        datehour: { [Op.lt]: dateHour },
      },
    });
  }

  /**
   * get the nomination stats for a given chainId and stash
   * @param chainId
   * @param stash
   * @returns
   */
  async getStats(chainId: string, stash: string) {
    logger.debug(`Getting stats for ${chainId} ${stash}`);

    const ret = await this.nominationRepository.findAll({
      where: { chainId, stash },
    });

    return ret.map((nom) => ({
      ...nom.dataValues,
      // force the commission to 2 decimal places and not scientific notation
      commission: Number(nom.dataValues.commission.toFixed(2)),
    }));
  }

  // every 30 seconds, get the data for the storage
  // @Cron(CronExpression.EVERY_5_MINUTES)
  // // every 30 seconds, get the data for the storage
  @Cron(interval)
  async handleInterval() {
    logger.debug('Getting data for storage');
    await this.getDataForStorage();
    await this.trimStorage();
  }
}
