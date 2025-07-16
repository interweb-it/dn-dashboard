// services/substrateService.ts
import { ApiPromise, WsProvider } from '@polkadot/api';
import { useSubstrateStore } from '~/stores/substrateStore';

export default class SubstrateService {
  private api: ApiPromise | null = null;
  private apip: ApiPromise | null = null; // people
  private chainId: string = 'kusama';
  private readonly WS_URL = 'wss://rpc.metaspan.io/'; // 'wss://rpc.ibp.network/';
  private substrateStore: any;
  private connecting: boolean = false;
  private connectPromise: Promise<void> | null = null;

  constructor() {
    console.debug('SubstrateService constructor');
    if (!import.meta.client) {
      console.debug('SubstrateService constructor client: SSR');
    } else {
      console.debug('SubstrateService constructor client: Client');
    }
    this.substrateStore = useSubstrateStore();
  }

  // Connect to the rpc server
  async connect(chainId: string): Promise<void> {
    if (!import.meta.client) {
      console.warn('SubstrateService is only available in the browser');
      return;
    }
    if (this.connectPromise) {
      // Wait for the ongoing connection to finish
      return this.connectPromise;
    }
    if (this.connecting) {
      // Defensive: should not be needed if connectPromise is used everywhere
      return;
    }
    this.connectPromise = (async () => {
      if (chainId !== this.chainId) {
        console.debug('substrateService.ts: connect(): disconnecting from', this.chainId);
        await this.disconnect();
        this.substrateStore.stakingEntries = [];
      }
      this.connecting = true;
      this.chainId = chainId;
      console.debug('substrateService.ts: connect(): connecting to', chainId);
      let provider = new WsProvider(this.WS_URL + chainId);
      this.api = await ApiPromise.create({ provider, noInitWarn: true });
      await this.api.isReady;
      this.substrateStore.setApiConnected(true);
      this.api.on('connected', (event) => {
        console.debug('substrateService.ts: on("connected"): Connected to api', chainId);
        this.substrateStore.setApiConnected(true);
      });
      // Handle api error event
      this.api.on('error', (event) => {
        console.debug('substrateService.ts: on("error"): api error', chainId, event);
      });
      // Handle api disconnect event
      this.api.on('disconnected', (event) => {
        console.debug('substrateService.ts: on("disconnected"): api disconnected', chainId, event);
        this.substrateStore.setApiConnected(false);
      });
      this.substrateStore.setApiConnected(true);

      provider = new WsProvider(this.WS_URL + 'people-' + chainId);
      this.apip = await ApiPromise.create({ provider, noInitWarn: true });
      await this.apip.isReady;
      this.substrateStore.setApipConnected(true);
      // Handle api open event
      this.apip.on('connected', (event) => {
        console.debug('substrateService.ts: on("connected"): Connected to apip', chainId);
        this.substrateStore.apipConnected = true;
      });
      this.apip.on('disconnected', (event) => {
        console.debug('substrateService.ts: on("disconnected"): apip disconnected', chainId, event);
        this.substrateStore.setApipConnected(false);
      });
      this.connecting = false;
      // reset this if the api is reconnected
      this.loadingNominators = false;
      this.connectPromise = null; // Clear the promise after connection is done
    })();
    return this.connectPromise;
  }

  // Disconnect the API
  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
      this.substrateStore.setApiConnected(false);
    }
    if (this.apip) {
      await this.apip.disconnect();
      this.apip = null;
      this.substrateStore.setApipConnected(false);
    }
  }

  async getApi(chainId: string): Promise<ApiPromise | null> {
    console.debug('substrateService.ts: getApi(): getting api for', chainId);
    if (this.api && this.chainId === chainId) {
      return this.api;
    } else {
      await this.connect(chainId);
      // this.chainId = chainId;
      return this.api;
    }
  }
  async getApip(chainId: string): Promise<ApiPromise | null> {
    if (this.apip && this.chainId === chainId) {
      return this.apip;
    } else {
      await this.connect(chainId);
      // this.chainId = chainId;
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
