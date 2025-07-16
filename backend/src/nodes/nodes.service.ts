import { Injectable, Inject, Logger, forwardRef } from '@nestjs/common';
import { TelemetryService } from 'src/telemetry/telemetry.service';

import { DatabaseService } from 'src/database/database.service';
import { Collection } from 'mongodb';
import { INode } from '@dn/common/dn';

const logger = new Logger('NodesService'.padEnd(18));

@Injectable()
export class NodesService {
  private readonly cohortsCollection: Collection;
  private readonly nodesCollection: Collection;
  private readonly telemetryCollection: Collection;
  private readonly nominationsCollection: Collection;
  private readonly cohortIds: string[] = ['1', '2', '2-1'];
  private readonly chainIds: string[] = ['polkadot', 'kusama'];

  constructor(
    // @Inject('NODE_REPOSITORY')
    // private nodeRepository: typeof NodeModel,
    @Inject(forwardRef(() => TelemetryService))
    private telemetryService: TelemetryService,
    // @Inject(forwardRef(() => BlockchainService))
    // private blockchainService: BlockchainService,
    @Inject(forwardRef(() => DatabaseService))
    private databaseService: DatabaseService,
  ) {
    this.cohortsCollection = this.databaseService.getMongoClient().db('dnd').collection('cohorts');
    this.nodesCollection = this.databaseService.getMongoClient().db('dnd').collection('nodes');
    this.telemetryCollection = this.databaseService.getMongoClient().db('dnd').collection('telemetry');
    this.nominationsCollection = this.databaseService.getMongoClient().db('dnd').collection('nominations');
  }

  async onModuleInit() {
    // make sure there are cohorts in the database
    for (const chainId of this.chainIds) {
      for (const cohortId of this.cohortIds) {
        const result = await fetch(`https://nodes.web3.foundation/api/cohort/${cohortId}/${chainId}`);
        // console.log('result', result);
        if (result.ok) {
          const cohort = await result.json();
          this.nodesCollection.updateOne({ chainId, cohortId }, { $set: { ...cohort, chainId } }, { upsert: true });
        }
      }
    }
  }

  async getSelected(chainId: string, cohortId: string) {
    logger.debug(`${chainId.padEnd(10)} getSelected ${chainId} ${cohortId}`);
    const cohort = await this.nodesCollection.findOne({ chainId, cohortId });
    if (!cohort) {
      logger.warn(`${chainId.padEnd(10)} getSelected ${chainId} ${cohortId} not found`);
      return [];
    }
    const telemetry = await this.telemetryCollection.find({ chainId }).toArray();
    const nodes: INode[] = [];
    for (const node of cohort.selected) {
      const _tel = telemetry.find((t) => t.identity === node.identity);
      if (_tel) {
        node.telemetryX = _tel;
      }
      nodes.push(node);
    }
    return nodes;
  }

  async getBackups(chainId: string, cohortId: string) {
    logger.debug(`${chainId.padEnd(10)} getBackups`);
    const nodes = await this.nodesCollection.find({ chainId, cohortId, status: 'backup' }).toArray();
    const telemetry = await this.telemetryCollection.find({ chainId }).toArray();
    for (const node of nodes) {
      const _tel = telemetry.find((t) => t.identity === node.identity);
      if (_tel) {
        node.telemetryX = _tel;
      }
    }
    return nodes;
  }

  /**
   * get the nominators for a cohort
   * @param chainId
   * @param cohortId
   * @returns string[] list of DN nominators
   */
  async getNominators(chainId: string, cohortId: string): Promise<string[]> {
    logger.debug(`${chainId.padEnd(10)} getNominators`);
    const cohort = await this.nodesCollection.findOne({ chainId, cohortId });
    return cohort.nominators || [];
  }

  async getNominations(chainId: string, stash: string): Promise<string[]> {
    logger.debug(`${chainId.padEnd(10)} getNominations ${stash}`);
    const nominations = await this.nominationsCollection.find({ chainId, targetId: stash }).toArray();
    console.log('nominations', nominations);
    return nominations.map((n) => n.accountId);
  }

  async getTerm(chainId: string, cohortId: string) {
    logger.debug(`${chainId.padEnd(10)} getTerm`);
    const node = await this.nodesCollection.findOne({ chainId, cohortId });
    return node ? { start: node.termStart, end: node.termEnd } : { start: '', end: '' };
  }

  async getCohortsForAddress(chainId: string, address: string) {
    const ret: Record<string, string> = {};
    const cohorts = await this.nodesCollection.find({ chainId }).toArray();
    for (const cohort of cohorts) {
      if (cohort.selected.includes(address)) {
        ret[cohort.cohortId] = 'selected';
      }
      if (cohort.backup.includes(address)) {
        ret[cohort.cohortId] = 'backup';
      }
    }
    return ret;
  }

  /**
   * Name, to node
   * @param chainId string
   * @param cohortId string
   * @param name string, DN registration name
   * @returns
   */
  async findNodeByName(chainId: string, cohortId: string, name: string) {
    logger.debug(`${chainId.padEnd(10)} findNodeByName ${name}`);
    const cohort = await this.nodesCollection.findOne({ chainId, cohortId });
    let node = cohort.selected.find((n) => n.identity === name);
    if (!node) {
      node = cohort.backup.find((n) => n.identity === name);
    }
    if (node.telemetry) {
      const _tel = await this.telemetryService.findOneByTelemetryName(chainId, node.telemetry);
      if (_tel) {
        node.telemetryX = _tel;
      }
    }
    return node;
  }

  async findNodeByStash(chainId: string, cohortId: string, stash: string) {
    logger.debug(`${chainId.padEnd(10)} findNodeByStash ${stash}`);
    const cohort = await this.nodesCollection.findOne({ chainId, cohortId });
    let node = cohort.selected.find((n) => n.stash === stash);
    if (!node) {
      node = cohort.backup.find((n) => n.stash === stash);
      if (!node) {
        logger.warn(`${chainId.padEnd(10)} can't find ${stash} in cohort ${cohortId}`);
        return null;
      }
    }
    if (node.telemetry) {
      const _tel = await this.telemetryService.findOneByTelemetryName(chainId, node.telemetry);
      if (_tel) {
        node.telemetryX = _tel;
      }
    }
    return node;
  }
}
