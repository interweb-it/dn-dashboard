import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Interval, Cron } from '@nestjs/schedule';

export type NodeStatus = 'Active' | 'Graduated' | 'Pending' | 'Removed';
export type ChainTerm = 'start' | 'end';

export interface INodeBase {
  identity: string;
  stash: string;
}

export interface INode extends INodeBase {
  status: NodeStatus;
}

export interface ITerm {
  start: string;
  end: string;
}

export interface IChainData {
  backups: INodeBase[];
  nominators: string[];
  selected: INode[];
  statuses: Record<NodeStatus, string>;
  term: ITerm;
}

const BASE_URL =
  'https://deploy-preview-7--decentralized-nodes-749eed.netlify.app/api/cohort/COHORT_ID/CHAIN_ID';

@Injectable()
export class NodesService implements OnModuleInit, OnModuleDestroy {
  private polkadotWS: WebSocket | null = null;
  private kusamaWS: WebSocket | null = null;

  private chains: Record<string, string> = {
    kusama:
      '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
    polkadot:
      '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  };

  private dataStore: Record<string, IChainData> = {
    polkadot: {} as IChainData,
    kusama: {} as IChainData,
  };

  async onModuleInit() {
    await this.fetchChainData('polkadot');
    await this.fetchChainData('kusama');
  }

  // Schedule a task to run every 5 minutes
  // @Cron('*/1 * * * * *')
  @Interval(5 * 60 * 1000) // Every 5 minutes
  async handleInterval() {
    console.log('Running scheduled task to fetch chain data');
    await this.fetchChainData('polkadot');
    await this.fetchChainData('kusama');
  }

  onModuleDestroy() {
    // this.disconnect();
  }

  private async fetchChainData(chainId: string) {
    console.log('fetchChainData', chainId);
    try {
      const url = BASE_URL.replace('COHORT_ID', '1').replace(
        'CHAIN_ID',
        chainId,
      );
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: IChainData = await response.json();
      console.log('Data fetched:', data);
      this.dataStore[chainId] = data;
      console.log(`Data updated for ${chainId}`);
    } catch (error) {
      console.error(`Failed to fetch data for ${chainId}:`, error.message);
    }
  }

  getSelected(chainId: string): INode[] {
    console.log('getNodes', chainId);
    const ret = Array.from(this.dataStore[chainId].selected);
    return ret; // this.dataStore[chainId].forEach((node) => node);
  }

  getBackups(chainId: string): INodeBase[] {
    console.log('getNodes', chainId);
    const ret = Array.from(this.dataStore[chainId].backups);
    return ret; // this.dataStore[chainId].forEach((node) => node);
  }

  getNominators(chainId: string): string[] {
    console.log('getNodes', chainId);
    const ret = Array.from(this.dataStore[chainId].nominators);
    return ret; // this.dataStore[chainId].forEach((node) => node);
  }

  getTerm(chainId: string): ITerm {
    console.log('getNodes', chainId);
    return this.dataStore[chainId].term;
  }

  findNodeByName(chainId: string, name: string): INode | INodeBase {
    console.log('findNodeByName', chainId, name);
    let node: INode | INodeBase;
    node = this.dataStore[chainId].selected.find(
      (node) => node.identity === name,
    );
    if (!node) {
      node = this.dataStore[chainId].backups.find(
        (node) => node.identity === name,
      );
    }
    return node;
  }

  findNodeByStash(chainId: string, stash: string): INode | INodeBase {
    console.log('findNodeByStash', chainId, stash);
    let node: INode | INodeBase;
    node = this.dataStore[chainId].selected.find(
      (node) => node.stash === stash,
    );
    if (!node) {
      node = this.dataStore[chainId].backups.find(
        (node) => node.stash === stash,
      );
    }
    return node;
  }
}
