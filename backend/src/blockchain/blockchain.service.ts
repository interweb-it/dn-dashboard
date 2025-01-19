import { Logger, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';

export interface INominator {
  address: string;
  balance: number;
  targets: string[];
}
export interface IExposureOther {
  who: string;
  value: bigint;
}
export interface IExposure {
  own: bigint;
  total: bigint;
  others: IExposureOther[];
}
export interface IValidator {
  address: string;
  identity?: string;
  commission: number;
  balance: number;
  exposure: IExposure[];
  active?: boolean;
}

interface IChainState {
  chainHash: string;
  api: any;
  subscription: any;
  session: number;
  sessionValidators: string[]; // session validators and exposures?
  allValidators: IValidator[]; // all validators
  nominators: INominator[]; // staker, account and targets
}

@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);

  private chains: Record<string, IChainState> = {
    kusama: {
      chainHash: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
      api: null,
      subscription: null,
      session: 0,
      sessionValidators: [],
      allValidators: [],
      nominators: [],
    },
    polkadot: {
      chainHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
      api: null,
      subscription: null,
      session: 0,
      sessionValidators: [],
      allValidators: [],
      nominators: [],
    },
  };
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

    this.chains[chainId].subscription = await api.rpc.chain.subscribeFinalizedHeads((header) => {
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
    this.logger.debug(`${chainId.padEnd(10)} is at block: #${header.number}`); // , header.hash.toString()
    const { api, session } = this.chains[chainId];
    const newSession = await api.query.session.currentIndex();
    if (Number(newSession.toString()) > session) {
      await this.handleNewSession(chainId, Number(newSession.toString()));
      // this.chains[chainId].session = Number(newSession.toString());
      // // get session validators
      // const validators = await api.query.session.validators();
      // this.logger.debug(chainId.padEnd(10), 'validators:', validators.length);
      // this.chains[chainId].validators = validators;
      // // const stash = '16ce9zrmiuAtdi9qv1tuiQ1RC1xR6y6NgnBcRtMoQeAobqpZ';
      // // const keys = await api.query.session.nextKeys(stash);
      // // this.logger.debug(chainId, stash, 'keys:', keys.toJSON());
    }
  }

  async handleNewSession(chainId: string, session: number) {
    this.logger.debug(`${chainId.padEnd(10)} new session: ${session.toString()}`);
    this.chains[chainId].session = session;
    await this._getAllValidators(chainId);
    await this._getSessionValidators(chainId);
    await this._getAllNominators(chainId);
  }

  async handleEvents(chainId: string, events: any[]) {
    this.logger.debug(`${chainId.padEnd(10)} events: ${events.length}`);
    events.forEach((record) => {
      // Extract the phase, event and the event types
      const { event, phase } = record;
      const types = event.typeDef;

      // Show what we are busy with
      this.logger.debug(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
      this.logger.debug(`\t\t${event.meta.documentation?.toString()}`);

      // Loop through each of the parameters, displaying the type and data
      event.data.forEach((data, index) => {
        this.logger.debug(`\t\t\t${types[index].type}: ${data.toString()}`);
      });
    });
  }

  async _getSessionValidators(chainId: string) {
    this.logger.debug(`${chainId.padEnd(10)} _getSessionValidators`);
    this.chains[chainId].sessionValidators = [];
    const validators = await this.chains[chainId].api.query.session.validators();
    // this.logger.debug(`${chainId.padEnd(10)} validators: ${validators.length}`);
    // validators.forEach((val) => {
    //   const v: IValidator = val.toJSON();
    //   console.log('v', v);
    //   this.chains[chainId].sessionValidators.push(v);
    // });
    this.chains[chainId].sessionValidators = validators.toJSON();
    this.logger.log(`${chainId.padEnd(10)} session validators ${this.chains[chainId].sessionValidators.length}`);
  }

  async _getAllValidators(chainId: string) {
    this.logger.debug(`${chainId.padEnd(10)} _getAllValidators`);
    if (!this.chains[chainId].api) {
      this.logger.warn('api not ready, backing off...');
      return;
    }
    this.chains[chainId].allValidators = [];
    const stakingEntries: any[] = await this.chains[chainId].api.query.staking.validators.entries();
    this.logger.debug(`${chainId.padEnd(10)} stakingEntries: ${stakingEntries.length}`);
    for (const [key, validatorPrefs] of stakingEntries) {
      try {
        const validatorAddress = key.args[0].toString();
        const exposure = (
          await this.chains[chainId].api.query.staking.erasStakers(0, validatorAddress)
        ).toJSON() as any;
        const accountData = (await this.chains[chainId].api.query.system.account(validatorAddress)).toJSON() as any;
        const balance = Number(BigInt(accountData.data.free)); // Available balance
        this.chains[chainId].allValidators.push({
          address: validatorAddress,
          // name: validatorPrefs.toJSON().validatorPrefs?.name,
          commission: Number(BigInt(validatorPrefs.toJSON()?.commission)) / 10_000_000,
          balance: balance,
          exposure: exposure.others,
        });
      } catch (err) {
        this.logger.error('stakingEntries error', err);
        continue;
      }
    }
    this.logger.log(`${chainId.padEnd(10)} validators ${this.chains[chainId].allValidators.length}`);
  }

  async _getAllNominators(chainId: string) {
    // loadingN.value = true
    this.logger.debug(`${chainId.padEnd(10)}, getAllNominators`);
    if (!this.chains[chainId].api) {
      this.logger.warn('api not ready, backing off...');
      return;
    }
    this.chains[chainId].nominators = [];
    let stakingEntries: any[] = [];
    try {
      stakingEntries = await this.chains[chainId].api.query.staking.nominators.entries();
    } catch (err) {
      this.logger.error('stakingEntries error', err);
      return;
    }
    this.logger.debug(`${chainId.padEnd(10)}, stakingEntries, ${stakingEntries?.length || 0}`);
    for (const [key, nominations] of stakingEntries) {
      try {
        const nominatorAddress = key.args[0].toString();
        // console.debug('nominatorAddress', nominatorAddress);
        const targets = nominations.toJSON() as any;
        const accountData = (await this.chains[chainId].api.query.system.account(nominatorAddress)).toJSON() as any;
        // console.debug('accountData', accountData);
        const balance = Number(BigInt(accountData.data.free)); // Available balance
        this.chains[chainId].nominators.push({ address: nominatorAddress, balance: balance, targets: targets.targets });
        // this.logger.debug(chainId.padEnd(10), 'nominatorAddress', nominatorAddress, targets.targets?.length || 0);
      } catch (err) {
        this.logger.error('stakingEntries error', err);
        continue;
      }
    }
    this.logger.log(`${chainId.padEnd(10)} nominators ${this.chains[chainId].nominators.length}`);
  }

  getSessionValidators(chainId: string) {
    this.logger.debug(`${chainId.padEnd(10)} getSessionValidators`);
    // console.log('this.chains[chainId].sessionValidators', this.chains[chainId].sessionValidators);
    return this.chains[chainId].allValidators.filter((val) =>
      this.chains[chainId].sessionValidators.includes(val.address),
    );
  }

  getAllValidators(chainId: string): IValidator[] {
    this.logger.debug(`${chainId.padEnd(10)} getAllValidators`);
    return this.chains[chainId].allValidators.map((val) => {
      // check if val is in sessionValidators
      const active = this.chains[chainId].sessionValidators.find((v) => v.toString() === val.address);
      return { ...val, active: active ? true : false };
    });
  }

  getValidator(chainId: string, address: string) {
    this.logger.debug(`${chainId.padEnd(10)} getValidator, ${address}`);
    const val = this.chains[chainId].allValidators.find((val) => val.address === address);
    if (!val) {
      return null;
    }
    // check if val is in sessionValidators
    const active = this.chains[chainId].sessionValidators.find((v) => v.toString() === address);
    val.active = active ? true : false;
    return val;
  }

  getNominators(chainId: string) {
    this.logger.debug(`${chainId.padEnd(10)} getNominators`);
    return this.chains[chainId].nominators;
  }

  getNominator(chainId: string, address: string) {
    this.logger.debug(`${chainId.padEnd(10)} getNominator, ${address}`);
    return this.chains[chainId].nominators.find((nom) => nom.address === address);
  }

  getNominatorsForStash(chainId: string, stash: string) {
    this.logger.debug(`${chainId.padEnd(10)} getNominatorsForStash, ${stash}`);
    return this.chains[chainId].nominators.filter((nom) => nom.targets.includes(stash));
  }
}
