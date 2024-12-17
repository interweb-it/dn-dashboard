// services/substrateService.ts
import { ApiPromise, WsProvider } from '@polkadot/api';
import { useSubstrateStore } from '~/stores/substrateStore';

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
    this.substrateStore = useSubstrateStore();
  }

  // Connect to the rpc server
  async connect(chainId: string): Promise<void> {
    if (!import.meta.client) {
      console.warn('SubstrateService is only available in the browser');
      return;
    }
    if (chainId !== this.chainId) {
      await this.disconnect();
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

  // // Handle browser online event
  // private handleOnline = (): void => {
  //   console.log('Browser is back online');
  //   this.isBrowserOnline = true;
  //   this.emitEvent('connection:online', { type: 'browser' });

  //   // Attempt to reconnect if disconnected
  //   if (!this.apiConnected || !this.apipConnected) {
  //     this.connect(this.chainId).catch((err) => console.error('Reconnection failed:', err));
  //   }
  // };

  // // Handle browser offline event
  // private handleOffline = (): void => {
  //   console.log('Browser is offline');
  //   this.isBrowserOnline = false;
  //   this.emitEvent('connection:offline', { type: 'browser' });
  // };

  // // Emit custom events
  // private emitEvent(eventName: string, detail: Record<string, any>): void {
  //   if(import.meta.client) {
  //     document.dispatchEvent(new CustomEvent(eventName, { detail }));
  //   }
  // }

  // // Cleanup event listeners
  // destroy(): void {
  //   if (import.meta.client) {
  //     window.removeEventListener('online', this.handleOnline);
  //     window.removeEventListener('offline', this.handleOffline);
  //     this.disconnect();
  //   }
  // }

}
