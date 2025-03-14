// services/substrateService.ts
import { ApiPromise, WsProvider } from '@polkadot/api';
import { useSubstrateStore } from '~/stores/substrateStore';
import { createPinia } from 'pinia';
const pinia = createPinia();
// const app = useNuxtApp();
// app.use(pinia);


export default class SubstrateService {
  private api: ApiPromise | null = null;
  private apip: ApiPromise | null = null; // people
  private chainId: string = 'kusama';
  private readonly WS_URL = 'wss://rpc.metaspan.io/'; // 'wss://rpc.ibp.network/';
  // protected apiConnected: boolean = false;
  // protected apipConnected: boolean = false;
  // private isBrowserOnline: boolean = true; //navigator.onLine;
  private substrateStore: any;

  constructor() {
    console.log('SubstrateService constructor');
    // const isSSR = import.meta.client;
    // if (!isSSR) {
      this.substrateStore = useSubstrateStore(pinia);
    // }
  }

  // Connect to the rpc server
  async connect(chainId: string): Promise<void> {
    if (!import.meta.client) {
      console.warn('SubstrateService is only available in the browser');
      return;
    }
    if (chainId !== this.chainId) {
      await this.disconnect();
      this.substrateStore.stakingEntries = [];
    }

    let provider = new WsProvider(this.WS_URL + chainId);
    this.api = await ApiPromise.create({ provider, noInitWarn: true });
    await this.api.isReady;
    // this.apiConnected = true;
    this.substrateStore.apiConnected = true;

    provider = new WsProvider(this.WS_URL + 'people-' + chainId);
    this.apip = await ApiPromise.create({ provider, noInitWarn: true });
    await this.apip.isReady;
    // this.apipConnected = true;
    this.substrateStore.apipConnected = true;

    // Handle api open event
    this.api.on('connected', (event) => {
      console.log('Connected to api', chainId);
      // this.apiConnected = true;
      this.substrateStore.apiConnected = true;
      // this.emitEvent('connection:online', { type: 'api', chainId });
    });
    this.apip.on('connected', (event) => {
      console.log('Connected to apip', chainId);
      // this.apipConnected = true;
      this.substrateStore.apipConnected = true;
      // this.emitEvent('connection:online', { type: 'apip', chainId });
    });
    // Handle api error event
    this.api.on('error', (event) => {
      console.log('api error', chainId, event);
    });
    // Handle api disconnect event
    this.api.on('disconnected', (event) => {
      console.log('api disconnected', chainId, event);
      // this.apiConnected = false;
      this.substrateStore.apiConnected = false;
      // this.emitEvent('connection:offline', { type: 'api', chainId });
    });
    this.apip.on('disconnected', (event) => {
      console.log('apip disconnected', chainId, event);
      // this.apipConnected = false;
      this.substrateStore.apipConnected = false;
      // this.emitEvent('connection:offline', { type: 'apip', chainId });
    });
    console.debug('Connected to api', chainId);
    // reset this if the api is reconnected
    this.loadingNominators = false;
  }

  // Disconnect the API
  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
    if (this.apip) {
      await this.apip.disconnect();
      this.apip = null;
    }
  }

  async getApi(chainId: string): Promise<ApiPromise | null> {
    if (this.api && this.chainId === chainId) {
      return this.api;
    } else {
      await this.connect(chainId);
      this.chainId = chainId;
      return this.api;
    }
  }
  async getApip(chainId: string): Promise<ApiPromise | null> {
    if (this.apip && this.chainId === chainId) {
      return this.apip;
    } else {
      await this.connect(chainId);
      this.chainId = chainId;
      return this.apip;
    }
  }

  protected loadingNominators: boolean = false;
  // getAllNominators = async () => {
  //   console.debug('get stakingEntries');
  //   if(!this.api) {
  //     if (this.chainId) {
  //       await this.connect(this.chainId);
  //     } else {
  //       console.warn('api not ready, backing off...');
  //       return
  //     }
  //   }
  //   if(this.loadingNominators) {
  //     console.warn('already loadingNominators');
  //     return
  //   }
  //   this.loadingNominators = true;
  //   this.substrateStore.loading = true;
  //   const stakingEntries = await this.api.query.staking.nominators.entries()
  //   const entries = stakingEntries.map(([key, nominations]) => {
  //     // console.debug('key', key.toString(), value);
  //     return [key, nominations.toJSON()]
  //   })
  //   console.debug('entries', entries.length);
  //   this.substrateStore.stakingEntries = entries
  //   this.loadingNominators = false;
  //   this.substrateStore.loading = false;
  // }

}
