import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger, forwardRef } from '@nestjs/common';
import { Interval, Cron } from '@nestjs/schedule';

import { BlockchainService } from 'src/blockchain/blockchain.service';
import { NodeDetailsX } from 'src/telemetry/telemetry.service';
import { TelemetryService } from 'src/telemetry/telemetry.service';

const logger = new Logger('NodesService'.padEnd(17));

export type NodeStatus = 'Active' | 'Graduated' | 'Pending' | 'Removed';
export type ChainTerm = 'start' | 'end';

export interface INodeBase {
  identity: string;
  stash: string;
  commission: number;
  telemetryX: NodeDetailsX;
  telemetry: string;
}

export interface INode extends INodeBase {
  status: NodeStatus;
}

export interface ITerm {
  start: string;
  end: string;
}

export interface ICohortData {
  backups: INodeBase[];
  nominators: string[];
  selected: INode[];
  statuses: Record<NodeStatus, string>;
  term: ITerm;
}

// export interface IChainData {
//   [cohortId: number]: ICohortData;
// }
export type TChainData = Record<number, ICohortData>;

const BASE_URL = 'https://nodes.web3.foundation/api/cohort/COHORT_ID/CHAIN_ID';

const cohorts = [1, 2];

@Injectable()
export class NodesService implements OnModuleInit, OnModuleDestroy {
  private polkadotWS: WebSocket | null = null;
  private kusamaWS: WebSocket | null = null;

  private chains: Record<string, string> = {
    kusama: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
    polkadot: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  };

  private dataStore: Record<string, TChainData> = {
    polkadot: {} as TChainData,
    kusama: {} as TChainData,
  };

  constructor(
    @Inject(forwardRef(() => BlockchainService))
    private blockchainService: BlockchainService,
    @Inject(forwardRef(() => TelemetryService))
    private telemetryService: TelemetryService,
  ) {}

  async onModuleInit() {
    for (const cohortId of cohorts) {
      logger.debug(`Fetching chain data for cohort ${cohortId}`);
      await this.fetchChainData('polkadot', cohortId);
      await this.fetchChainData('kusama', cohortId);
      await this.handleInterval();
    }
  }

  // Schedule a task to run every 5 minutes
  // @Cron('*/1 * * * * *')
  @Interval(5 * 60 * 1000) // Every 5 minutes
  // @Interval(30 * 1000) // every 30 seconds
  async handleInterval() {
    logger.debug('Running scheduled task to fetch chain data');
    for (const cohortId of cohorts) {
      await this.fetchChainData('polkadot', cohortId);
      await this.fetchChainData('kusama', cohortId);
    }
  }

  onModuleDestroy() {
    // this.disconnect();
  }

  private async fetchChainData(chainId: string, cohortId: number = 1) {
    logger.debug(`${chainId.padEnd(10)} fetchChainData`);
    let data: ICohortData = {
      backups: [],
      nominators: [],
      selected: [],
      statuses: {} as Record<NodeStatus, string>,
      term: { start: '', end: '' },
    };
    try {
      const url = BASE_URL.replace('COHORT_ID', cohortId.toString()).replace('CHAIN_ID', chainId);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data = await response.json();
      logger.debug(`${chainId.padEnd(10)} got data`, data);
    } catch (error) {
      logger.error(`${chainId.padEnd(10)} Failed to fetch data for nodes`, error);
    }

    // for each data.node, update the node commission
    const ex = [
      {
        identity: 'UTSA',
        stash: '15wnPRex2QwgWNCMRVSqgqp2syDn8Gf6LPGGabRhA8zoohpt',
        status: 'Active',
        telemetry: 'UTSA',
      },
      {
        identity: 'VISIONSTAKE 👁‍🗨',
        stash: '13Hp4FEF7z7famvakw8cgioHqDxcnhnyQkvd1jF4dxn7cayG',
        status: 'Active',
        telemetry: null,
      },
    ];
    for (const node of data.selected) {
      const _val = await this.blockchainService.getValidator(chainId, node.stash);
      node.commission = _val?.commission || 0;
      if (node.telemetry && node.telemetry !== '') {
        // amend the telemetry name map
        this.telemetryService.updateTelemetryNameForNode(chainId, node.identity, node.telemetry);
      }
    }
    for (const node of data?.backups || []) {
      const _val = await this.blockchainService.getValidator(chainId, node.stash);
      node.commission = _val?.commission || 0;
    }
    this.dataStore[chainId][cohortId] = data;
    logger.debug(`${chainId.padEnd(10)} Nodes data updated`);
  }

  getSelected(chainId: string, cohortId: number): INode[] {
    logger.debug(`${chainId.padEnd(10)} getSelectecd`);
    const ret = Array.from(this.dataStore[chainId][cohortId]?.selected || []);
    // get telemetry data for each node
    for (const node of ret) {
      const _tel = this.telemetryService.findOneByDNIdentity(chainId, node.identity);
      if (_tel) {
        node.telemetryX = _tel.NodeDetails;
      }
    }
    logger.debug('getNodes', chainId, ret);
    return ret;
  }

  getBackups(chainId: string, cohortId: number): INodeBase[] {
    logger.debug(`${chainId.padEnd(10)} getBackups`);
    const ret = Array.from(this.dataStore[chainId][cohortId]?.backups || []);
    return ret;
  }

  getNominators(chainId: string, cohortId: number): string[] {
    logger.debug(`${chainId.padEnd(10)} getNominators`);
    const ret = Array.from(this.dataStore[chainId][cohortId]?.nominators || []);
    return ret;
  }

  getTerm(chainId: string, cohortId): ITerm {
    logger.debug(`${chainId.padEnd(10)} getTerm`);
    return this.dataStore[chainId][cohortId].term;
  }

  getCohortsForAddress(chainId: string, address: string): number[] {
    logger.debug(`${chainId.padEnd(10)} getCohortsForAddress ${address}`);
    const ret = [];
    for (const cohortId of cohorts) {
      const _nodes = this.dataStore[chainId][cohortId].selected.filter((node) => node.stash === address);
      if (_nodes.length > 0) {
        ret.push(cohortId);
      }
    }
    return ret;
  }

  findNodeByName(chainId: string, cohortId: number, name: string): INode | INodeBase {
    logger.debug(`${chainId.padEnd(10)} findNodeByName ${name}`);
    let node: INode | INodeBase;
    node = this.dataStore[chainId][cohortId].selected.find((node) => node.identity === name);
    if (!node) {
      node = this.dataStore[chainId][cohortId].backups.find((node) => node.identity === name);
    }
    return node;
  }

  findNodeByStash(chainId: string, cohortId: number, stash: string): INode | INodeBase {
    logger.debug(`${chainId.padEnd(10)} findNodeByStash ${stash}`);
    let node: INode | INodeBase;
    node = this.dataStore[chainId][cohortId].selected.find((node) => node.stash === stash);
    if (!node) {
      logger.debug(`${chainId.padEnd(10)} can't find ${stash} in selected... trying backups`);
      node = this.dataStore[chainId][cohortId]?.backups.find((node) => node.stash === stash);
      if (!node) {
        logger.warn(`${chainId.padEnd(10)} can't find ${stash} in cohort ${cohortId}`);
        return null;
      }
    }
    // get telemetry data for the node
    if (node.telemetry) {
      // this is the telemetry name
      const _tel = this.telemetryService.findOneByTelemetryName(chainId, node.telemetry);
      if (_tel) {
        node.telemetryX = _tel.NodeDetails;
      }
    }
    return node;
  }
}
