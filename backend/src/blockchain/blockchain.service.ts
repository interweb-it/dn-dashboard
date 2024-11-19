import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';

@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private chains: Record<string, any> = {
    kusama: {
      chainHash:
        '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
      api: null,
      subscription: null,
      session: 0,
      validators: [],
    },
    polkadot: {
      chainHash:
        '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
      api: null,
      subscription: null,
      session: 0,
      validators: [],
    },
  };
  // private polkadotAPI: ApiPromise | null = null;
  // private kusamaAPI: ApiPromise | null = null;
  // private subscriptions: Record<string, any> = {
  //   polkadot: null,
  //   kusama: null,
  // };
  // private sessions: Record<string, number> = {
  //   polkadot: 0,
  //   kusama: 0,
  // };
  private readonly WSS_BASE_URL = 'wss://rpc.ibp.network/';

  onModuleInit() {
    this.connect('polkadot');
    this.connect('kusama');
  }

  onModuleDestroy() {
    this.disconnect();
  }

  private async connect(chainId: string) {
    // const ws = new WebSocket(this.TELEMETRY_WS_URL);
    const provider = new WsProvider(this.WSS_BASE_URL + chainId);
    const api = new ApiPromise({ provider, noInitWarn: true });
    await api.isReady;

    this.chains[chainId].subscription =
      await api.rpc.chain.subscribeFinalizedHeads((header) => {
        this.handleBlock(chainId, header);
      });
    // this.subscriptions[chainId] = await api.query.system.events((events) => {
    //   this.handleEvents(chainId, events);
    // });

    this.chains[chainId].api = api;
  }

  private disconnect() {
    if (this.chains['polkadot'].subscription) {
      this.chains['polkadot'].subscription();
    }
    if (this.chains['kusama'].subscription) {
      this.chains['kusama'].subscription();
    }
    this.chains['polkadot'].api?.disconnect();
    this.chains['kusama'].api?.disconnect();
    this.chains['polkadot'].api = null;
    this.chains['kusama'].api = null;
  }

  async handleBlock(chainId: string, header: any) {
    console.log(
      `${chainId} is at block: #${header.number}`,
      header.hash.toString(),
    );
    const { api, session } = this.chains[chainId];
    const newSession = await api.query.session.currentIndex();
    if (Number(newSession.toString()) > session) {
      console.log(chainId, 'new session:', newSession.toString());
      this.chains[chainId].session = Number(newSession.toString());
      // get session validators
      const validators = await api.query.session.validators();
      console.log(chainId, 'validators:', validators.length);
      this.chains[chainId].validators = validators;
      // const stash = '16ce9zrmiuAtdi9qv1tuiQ1RC1xR6y6NgnBcRtMoQeAobqpZ';
      // const keys = await api.query.session.nextKeys(stash);
      // console.log(chainId, stash, 'keys:', keys.toJSON());
    }
  }

  async handleEvents(chainId: string, events: any[]) {
    console.log(chainId, 'events:', events.length);
    events.forEach((record) => {
      // Extract the phase, event and the event types
      const { event, phase } = record;
      const types = event.typeDef;

      // Show what we are busy with
      console.log(
        `\t${event.section}:${event.method}:: (phase=${phase.toString()})`,
      );
      console.log(`\t\t${event.meta.documentation?.toString()}`);

      // Loop through each of the parameters, displaying the type and data
      event.data.forEach((data, index) => {
        console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
      });
    });
  }

  getValidators(chainId: string) {
    console.log('getValidators', chainId);
    return this.chains[chainId].validators;
  }
}
