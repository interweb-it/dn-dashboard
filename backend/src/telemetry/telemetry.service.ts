import * as fs from 'fs';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebSocket } from 'ws';

// import { telemetryNameMap } from './telemetry.map';
let telemetryNameMap: Record<string, Record<string, string>> = {
  kusama: {},
  polkadot: {},
};

import { FeedMessage } from '../substrate-telemetry';
import type { Maybe } from '../substrate-telemetry/helpers';
import type {
  NodeDetails,
  NodeStats,
  NodeIO,
  NodeHardware,
  BlockDetails,
  NodeLocation,
  Timestamp,
  NodeSysInfo,
  ChainStats,
} from '../substrate-telemetry/types';
import { AddedNodeMessage, RemovedNodeMessage } from 'src/substrate-telemetry/feed';

type IPGeo = {
  query: string;
  status: string;
  message: string;
  country: string;
  city: string;
  lat: number;
  lon: number;
  timestamp: number;
};
export interface AddedNodeMessageX {
  NodeId: number;
  NodeDetails: NodeDetailsX;
  NodeStats: NodeStats;
  NodeIO: NodeIO;
  NodeHardware: NodeHardware;
  BlockDetails: BlockDetailsX;
  NodeLocation: NodeLocationX;
  IPGeo?: IPGeo;
  Timestamp: Maybe<Timestamp>;
}
// interface RemovedNodeMessageX {
//   NodeId: number
// }
export interface NodeDetailsX {
  NodeName: string;
  TelemetryName: string;
  NodeImplementation: string;
  NodeVersion: string;
  // NetworkId: Maybe<string>,
  Field4: string;
  NetworkId: string;
  Address: Maybe<string>;
  // OperatingSystem: string;
  NodeSysInfo: NodeSysInfoX;
  // CpuArchitecture: string;
  // TargetEnv: string;
  // _undefined: undefined;
  ChainStats: ChainStats;
}

export interface NodeSysInfoX {
  cpu: string;
  memory: number;
  core_count: number;
  linux_kernel: string;
  linux_distro: string;
  is_virtual_machine: boolean;
}
export interface BlockDetailsX {
  BlockNumber: number;
  BlockHash: string;
  Milliseconds: number;
  Timestamp: number;
  PropagationTime: Maybe<number>;
}
export interface NodeLocationX {
  Latitude: number;
  Longitude: number;
  City: string;
}

// type NodeInfo = {
//   name: string;
//   network: string;
//   version: string;
// };

const parseNodeLocation = (data: NodeLocation): NodeLocationX => {
  console.debug('Parsing NodeLocation', data);
  if (!Array.isArray(data)) {
    return data;
  }
  if (!data) return null;
  const [Latitude, Longitude, City] = data;
  return {
    Latitude,
    Longitude,
    City,
  };
};

const parseBlockDetails = (data: BlockDetails): BlockDetailsX => {
  const [BlockNumber, BlockHash, Milliseconds, Timestamp, PropagationTime] = data;
  return {
    BlockNumber,
    BlockHash,
    Milliseconds,
    Timestamp,
    PropagationTime,
  };
};

const parseNodeSysInfo = (data: NodeSysInfo): NodeSysInfoX => {
  // console.debug('Parsing NodeSysInfo', data);
  // if not array, return data
  if (!Array.isArray(data)) {
    return data;
  }
  const [cpu, memory, core_count, linux_kernel, linux_distro, is_virtual_machine] = data;
  return {
    cpu,
    memory,
    core_count,
    linux_kernel,
    linux_distro,
    is_virtual_machine,
  };
};

// const parseChainStats = (data: ChainStats): ChainStats => {
//   console.debug('parseChainStats', data);
//   return data;
// };

const parseNodeDetails = (data: NodeDetails): NodeDetailsX => {
  // const [NodeName, NodeImplementation, NodeVersion, Address, NetworkId, OperatingSystem, CpuArchitecture, TargetEnv, _, NodeSysInfo] = data
  const [
    NodeName,
    NodeImplementation,
    NodeVersion,
    Field4,
    // OperatingSystem,
    NetworkId,
    Address,
    // CpuArchitecture,
    // TargetEnv,
    // _,
    NodeSysInfo,
    ChainStats,
  ] = data;
  //console.debug('Parsing NodeDetails chain stats', ChainStats);
  return {
    NodeName,
    TelemetryName: null,
    NodeImplementation,
    NodeVersion,
    Field4,
    NetworkId: NetworkId || '',
    Address,
    // OperatingSystem,
    // CpuArchitecture,
    // TargetEnv,
    // _undefined: _,
    NodeSysInfo: parseNodeSysInfo(NodeSysInfo),
    // ChainStats: parseChainStats(ChainStats),
    ChainStats,
  };
};

const parseAddedNodeMessage = (data: AddedNodeMessage): AddedNodeMessageX => {
  //console.debug('Parsing AddedNodeMessage', data.payload);
  const [NodeId, NodeDetails, NodeStats, NodeIO, NodeHardware, BlockDetails, NodeLocation, Timestamp] = data.payload;
  const parsedNodeDetails = parseNodeDetails(NodeDetails);
  //console.debug('Parsed NodeDetails', parsedNodeDetails);
  return {
    NodeId: NodeId,
    NodeDetails: parsedNodeDetails, // parseNodeDetails(NodeDetails),
    NodeStats,
    NodeIO,
    NodeHardware,
    BlockDetails: parseBlockDetails(BlockDetails),
    NodeLocation: parseNodeLocation(NodeLocation),
    Timestamp,
  };
};

// const parseRemovedNodeMessage = (data: RemovedNodeMessage): number => {
//   console.debug('Parsing RemovedNodeMessage', data.payload);
//   // const [NodeId] = data.payload
//   // return NodeId
//   return data.payload;
// };

@Injectable()
export class TelemetryService implements OnModuleInit, OnModuleDestroy {
  private polkadotWS: WebSocket | null = null;
  private kusamaWS: WebSocket | null = null;
  private readonly TELEMETRY_WS_URL = 'wss://telemetry-backend.w3f.community/feed';
  private chains: Record<string, string> = {
    kusama: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
    polkadot: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  };
  private dataStore: Record<string, Map<number, AddedNodeMessageX>> = {
    polkadot: new Map<number, AddedNodeMessageX>(), // [],
    kusama: new Map<number, AddedNodeMessageX>(), // [],
  };
  private ipGeo = new Map<string, any>();

  onModuleInit() {
    this.connect('polkadot');
    this.connect('kusama');
    this.updateTelemetryNameMap();
    this.readIPGeoFile();
    // wait 30 secnds
    // setTimeout(() => {
    //   this.updateGeoIP();
    // }, 30_000);
  }

  onModuleDestroy() {
    this.disconnect();
  }

  private connect(chainId: string) {
    const ws = new WebSocket(this.TELEMETRY_WS_URL);
    ws.onopen = () => {
      console.log(`Connected to ${chainId} telemetry`);
      const chainHash = this.chains[chainId];
      console.log(`Subscribing to ${chainId} telemetry for ${chainHash}`);
      ws.send(`subscribe:${chainHash}`);
    };

    ws.onmessage = async (event) => {
      // console.log(`Received telemetry message for ${chain}`);
      // console.debug(event);
      let rawData: any;
      // Check if the data is a Buffer and convert it to a string
      if (Buffer.isBuffer(event.data)) {
        rawData = event.data.toString('utf-8');
      } else {
        rawData = event.data;
      }

      try {
        // const messages = JSON.parse(event.data.toString());
        // messages.forEach((message: any) => {
        //   if (message.action === 'addNode') {
        //     this.dataStore[chainId].push(message.payload);
        //   }
        // });
        const messages: any[] = FeedMessage.deserialize(rawData);

        messages.forEach((message) => {
          // console.debug('Received telemetry message:', message);
          // this.listeners.forEach((callback) => callback(message));
          this.handleTelemetryMessage(chainId, message);
        });
      } catch (error) {
        console.error(`Error parsing telemetry message for ${chainId}:`, error);
      }
    };

    ws.onclose = () => {
      console.log(`Disconnected from ${chainId} telemetry, reconnecting...`);
      setTimeout(() => {
        this.connect(chainId);
      }, 5000);
    };
    ws.onerror = (error) => console.error(`${chainId} telemetry WebSocket error:`, error);

    if (chainId === 'polkadot') {
      this.polkadotWS = ws;
    } else {
      this.kusamaWS = ws;
    }
  }

  private disconnect() {
    this.polkadotWS?.close();
    this.kusamaWS?.close();
  }

  async addNode(chainId: string, message: AddedNodeMessageX) {
    // console.log('AddedNode', chainId, message.NodeId, message.NodeDetails.NodeName, message.NodeDetails.ChainStats);
    //console.log('AddedNode', message[1].NodeId, message[1].NodeDetails);
    console.log(`${chainId}, |${message.NodeDetails.NodeName}|`);
    // TODO: attempt to match the node name with the telemetry name
    this.dataStore[chainId].set(message.NodeId, message);
  }

  removeNode(chainId: string, message: RemovedNodeMessage) {
    // console.log('RemovedNode', message);
    this.dataStore[chainId].delete(message.payload);
  }

  getNodes(chainId: string): AddedNodeMessageX[] {
    console.log('getNodes', chainId);
    const ret = Array.from(this.dataStore[chainId].values());
    ret.forEach((node) => {
      if (node.NodeDetails.Address) {
        node.IPGeo = this.getGeoForIP(node.NodeDetails.Address);
      }
    });
    return ret; // this.dataStore[chainId].forEach((node) => node);
  }

  getNode(chainId: string, nodeId: number): AddedNodeMessageX | undefined {
    console.log('getNode', chainId, nodeId);
    console.log('size', this.dataStore[chainId].size);
    return this.dataStore[chainId].get(nodeId);
  }

  getNames(chainId: string): string[] {
    return Array.from(this.dataStore[chainId].values()).map((node) => node.NodeDetails.NodeName);
  }

  findOneById(chainId: string, nodeId: number): AddedNodeMessageX {
    console.log('findOneById', chainId, nodeId);
    // console.log('size', this.dataStore[chainId]);
    const node = this.dataStore[chainId].get(nodeId);
    console.debug('findOneById', node);
    return node;
  }

  findOneByNetworkId(chainId: string, networkId: string): AddedNodeMessageX {
    return Array.from(this.dataStore[chainId].values()).find((node) => node.NodeDetails.NetworkId === networkId);
  }

  findOneByName(chainId: string, nodeName: string): AddedNodeMessageX {
    let ret: AddedNodeMessageX | undefined;
    const _name = telemetryNameMap[chainId][nodeName] || nodeName;
    console.log('telemetry.service.ts: findOneByName', chainId, _name, 'from', nodeName);
    this.dataStore[chainId].forEach((node) => {
      if (node.NodeDetails.NodeName === _name) {
        // console.log('findOneByName ChainStats:', node.NodeDetails.ChainStats);
        if (!node.NodeDetails.ChainStats) {
          console.warn('ChainStats is missing:', node.NodeDetails);
        }
        ret = node;
        if (_name !== nodeName) ret.NodeDetails.TelemetryName = _name;
      }
    });
    // console.log('findOneByName ChainStats:', ret);
    if (ret.NodeDetails.Address) {
      ret.IPGeo = this.getGeoForIP(ret.NodeDetails.Address);
    }
    return ret;
  }

  getGeoForIP(ip: string): IPGeo | undefined {
    if (!ip) return undefined;
    if (!this.ipGeo.has(ip)) {
      console.log('IP Geo data not found:', ip);
      return undefined;
    }
    console.log('IP Geo data found:', ip, this.ipGeo.get(ip));
    return this.ipGeo.get(ip);
  }

  private async updateTelemetryNameMap() {
    console.debug('Fetching telemetry name map...');
    const url =
      'https://raw.githubusercontent.com/metaspan/dn-dashboard/refs/heads/main/backend/config/telemetryNameMap.json';
    try {
      const response = await fetch(url);
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      const data = await response.json();
      if (data) {
        telemetryNameMap = data;
        console.log('Telemetry Name Map updated successfully:', telemetryNameMap);
        console.log('Telemetry Name Map updated successfully:', telemetryNameMap);
      } else {
        console.error('Failed to update telemetry name map:', data);
      }
    } catch (error) {
      console.error('Error fetching telemetry name map:', error.message);
    }
  }

  private async readIPGeoFile() {
    console.debug('Reading IP Geo file...');
    const filename = 'ipgeo.json';
    try {
      const data = fs.readFileSync(filename, 'utf-8');
      const geo: Record<string, IPGeo> = JSON.parse(data);
      Object.entries(geo).forEach(([address, value]) => {
        this.ipGeo.set(address, value);
      });
    } catch (error) {
      console.error('Error reading IP Geo file:', error.message);
    }
    console.debug('IP Geo:', this.ipGeo);
  }

  private async writeIPGeoFile() {
    const filename = 'ipgeo.json';
    try {
      const data = {};
      this.ipGeo.forEach((value, key) => {
        data[key] = value;
      });
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing IP Geo file:', error.message);
    }
  }

  private async updateGeoIP() {
    console.log('Fetching GeoIP data...');
    let batch = [];
    let updated = 0;
    // for each chain
    for (const chainId of ['kusama', 'polkadot']) {
      // for each node
      console.log('geoIP for', chainId);
      this.dataStore[chainId].forEach((node) => {
        // console.log('geoIP for', chainId, node.NodeDetails.NodeName, node.NodeDetails.Address);
        // geoip lookup
        const ip = node.NodeDetails.Address;
        if (ip) {
          if (!this.ipGeo.has(ip)) {
            batch.push(ip);
            updated++;
          } else {
            const lastUpdate = this.ipGeo.get(ip).timestamp;
            // 24 hours
            if (Date.now() - lastUpdate > 86400 * 1000) {
              console.log('IP Geo data is stale:', ip);
              batch.push(ip);
              updated++;
            }
            // console.log('IP already in cache:', ip);
          }
        }
      });
      console.debug(chainId, 'Batch:', batch.length);
      if (batch.length > 0) {
        const fields = 'query,status,message,country,city,lat,lon';
        const params = JSON.stringify(batch.slice(0, 10).map((ip) => ({ query: ip, fields })));
        console.debug('Params:', params);
        try {
          const geo = await fetch(`http://ip-api.com/batch`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: params,
          });
          const resp = await geo.json();
          console.log('geo', resp);
          resp.forEach((data: IPGeo) => {
            const ip = data.query;
            data.timestamp = Date.now();
            this.ipGeo.set(ip, data);
          });
        } catch (error) {
          console.error('Error fetching GeoIP data:', error.message);
        } finally {
          batch = [];
        }
      }
    }
    if (updated > 0) await this.writeIPGeoFile();
  }

  // Cron job to periodically update the telemetry map
  @Cron(CronExpression.EVERY_10_MINUTES)
  // @Cron(CronExpression.EVERY_30_SECONDS)
  handleCron() {
    console.log('Fetching telemetry name map...');
    this.updateTelemetryNameMap();
    this.updateGeoIP();
  }

  handleTelemetryMessage(chainId: string, message: any) {
    // console.log('Received telemetry message:', message);
    //let ex: any | null = null;
    let messageX;
    // https://github.com/paritytech/substrate-telemetry/blob/master/frontend/src/common/feed.ts
    switch (message.action) {
      case 0: // FeedVersion
        // chainName, chainHash, number of nodes
        //ex = [0,32,11,["Westend Asset Hub","0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9",7],11,["BalanceAI Testnet","0x26bb1f3f98cd7bfb43c25a21a6913471338e8db2090d1c2d57eb9ebb5711d3a8",1],11,["Polkadot","0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",387],11,["Encointer on Kusama","0x7dd99936c1e9e6d1ce7d90eb6f33bea8393b4bf87677d675aa63c9cb3e8c5b5b",16],11,["Polkadot BridgeHub","0xdcf691b5a3fbe24adc99ddc959c0561b973e329b1aef4c4b22e7bb2ddecb4464",15],11,["Paseo Testnet","0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f",51],11,["Hyperbridge (Nexus)","0x61ea8a51fd4a058ee8c0e86df0a89cc85b8b67a0a66432893d09719050c9f540",3],11,["Westend People","0x1eb6fb0ba5187434de017a70cb84d4f47142df1d571d0ef9e7e1407f2b80b93c",11],11,["Kusama People","0xc1af4cb4eb3918e5db15086c0cc5ec17fb334f728b7c65dd44bfe1e174ff8b3f",18],11,["Astar","0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6",6],11,["Kusama Coretime","0x638cd2b9af4b3bb54b8c1f0d22711fc89924ca93300f0caf25a580432b29d050",14],11,["Paseo People","0xe6c30d6e148f250b887105237bcaa5cb9f16dd203bf7b5b9d4f1da7387cb86ec",8],11,["Hydration","0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d",6],11,["Westend","0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e",9],11,["Ajuna Polkadot","0xe358eb1d11b31255a286c12e44fe6780b7edb171d657905a97e39f71d9c6c3ee",3],11,["Bifrost Polkadot","0x262e1b2ad728475fd6fe88e62d34c200abe6fd693931ddad144059b1eb884e5b",4],11,["Polimec Polkadot","0x7eb9354488318e7549c722669dcbdcdc526f1fef1420e7944667212f3601fdbd",5],11,["Picasso","0x6811a339673c9daa897944dcdac99c6e2939cc88245ed21951a0a3c9a2be75bc",1],11,["Kusama","0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",902],11,["Xode Testnet","0x82d0db85291796596aa5096b64f62d1cfaae9ea23e58e16efb9626b683db9d64",2],11,["Basilisk","0xa85cfb9b9fd4d622a5b28289a02347af987d8f73fa3108450e2b4a11c1ce5755",1],11,["Westend BridgeHub","0x0441383e31d1266a92b4cb2ddd4c2e3661ac476996db7e5844c52433b81fe782",6],11,["Parallel","0xe61a41c53f5dcd0beb09df93b34402aada44cb05117b71059cce40a2723a4e97",1],11,["Polkadot Asset Hub","0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f",15],11,["Karura","0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b",2],11,["Paseo Bridge Hub","0xcc624979479dc37afee4cb23cb72b1772bbf377c0d3e8fa257c0fe6146572e3e",8],11,["Khala","0xd43540ba6d3eb4897c28a77d48cb5b729fea37603cbbfc7a86a73b72adb3be8d",1],11,["Polkadot Coretime","0xefb56e30d9b4a24099f88820987d0f45fb645992416535d87650d98e00f46fc4",12],11,["KILT Spiritnet","0x411f057b9107718c9624d6aa4a3f23c1653898297f3d4d529d9bb6511a39dd21",4],11,["Kusama Asset Hub","0x48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a",16],11,["Acala","0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c",3],11,["Moonbeam","0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d",4],11,["Avail Turing Network","0xd3d2f3a3495dc597434a99d7d449ebad6616db45e4e4f178f31cc6fa14378b70",1],11,["Kusama BridgeHub","0x00dcb981df86429de8bbacf9803401f09485366c44efbf53af9ecfab03adc7e5",15],11,["Westend Coretime","0xf938510edee7c23efa6e9db74f227c827a1b518bffe92e2f6c9842dc53d38840",9],11,["Xode","0x28cc1df52619f4edd9f0389a7e910a636276075ecc429600f1dd434e281a04e9",3],11,["Phala","0x1bb969d85965e4bb5a651abbedf21a54b6b31a21f66b5401cc3f1e286268d736",1],11,["Westend Collectives","0x713daf193a6301583ff467be736da27ef0a72711b248927ba413f573d2b38e44",7],11,["Frequency","0x4a587bf17a404e3572747add7aab7bbe56e805a5479c6c436f07f36fcc8d3ae1",1],11,["UNIQUE","0x84322d9cddbf35088f1e54e9a85c967a41a56a4f43445768125e61af166c7d31",4],11,["Collectives","0x46ee89aa2eedd13e988962630ec9fb7565964cf5023bb351f2b6b25c1b68b0b2",14],11,["Paseo Coretime","0xc806038cc1d06766f23074ade7c5511326be41646deabc259970ff280c82a464",11],11,["Polkadot People","0x67fa177a097bfa18f77ea95ab56e9bcdfeb0e5b8a40e46298bb93e16b6fc5008",17],11,["Paseo Asset Hub","0xd6eec26135305a8ad257a20d003357284c8aa03d0bdb2b357ab0a22371e11ef2",11],11,["Hyperbridge (Gargantua)","0x19c5b43935ee2a7e4a090e2bde16ea106bcb1b3668a9abcd37bbceb8c9df16d4",1],11,["InvArch Network","0x31a7d8914fb31c249b972f18c115f1e22b4b039abbcb03c73b6774c5642f9efe",1]]
        //ex = message.data as FeedVersion;
        break;
      case 1: // BestBlock
        //ex = [1,25778144,1731599988145,6239,6,779,25778144,'0x790eccd0983be3360a81c003e925be6d30f0a78d18fac3f2b9ddd0521d03ae84',5779,1731599988145,0]
        break;
      case 2: // BestFinalized
        break;
      case 3: // AddedNode: NodeId,NodeDetails,NodeStats,NodeIO,NodeHardware,BlockDetails,Maybe<NodeLocation>,Maybe<Timestamp>
        // ex = [3,458,'🚂 Zugian Duck 🦆 Retainer','Parity Polkadot',1.16.1-835e0767fe8,,'12D3KooWRLprG6JDs5ZKzqU6ofczisASiZj5jZsddE6jgDBiyen3','185.16.38.241',['object Object'],['object Object'],51,0,48113384,49532904,50902990,52177076,53397204,54705856,55610110,54000116,52617828,51011372,49683310,48384504,4683746.75,4151928.625,4513870.375,1502013.25,836828.25,3588572.5,2417731,1050204.25,1032821,3741390.5,1731022.5,1931825.25,4221619.875,4272979.125,3675492.75,3796463.125,3248460.875,3109559.25,3423068.25,3730033.75,3470817.625,3793650,3887323.875,5391535,1731599504706.75,1731599544709.1875,1731599584711.125,1731599624712.625,1731599664713.4375,1731599704721.875,1731599744724.125,1731599784718.5,1731599824721.75,1731599864722.75,1731599904723.8125,1731599944735.5,25778144,0x790eccd0983be3360a81c003e925be6d30f0a78d18fac3f2b9ddd0521d03ae84,6079,1731599988419,274,,1731311512077]
        // this.nodes.set(message.payload[0], message.payload);
        messageX = parseAddedNodeMessage(message);
        // console.debug('Pre addNode', messageX.NodeDetails.ChainStats);
        this.addNode(chainId, messageX);
        // console.log('AddedNode', message.payload);
        break;
      case 4: // RemovedNode
        //ex = [4, 5]
        // this.nodes.delete(message.payload[0]);
        this.removeNode(chainId, message);
        // console.log('RemovedNode', message.payload);
        break;
      case 5: // LocatedNode
        //ex = [5, 528, 47.5421, 7.5962, 'Basel'];
        // let node = this.nodes.get(message.payload[0]);
        // if (node) {
        //   node[6] = message.payload[1];
        //   node[7] = message.payload[2];
        //   node[8] = message.payload[3];
        // }
        break;
      case 6: // ImportedBlock
        //ex = [6,[200,[1400080,"0x885de4c403ed4e1bc31dde5dccca4d2520e5f184d8fd15440854349524796bbd",74,1731599698617,null]]]
        break;
      case 7: // FinalizedBlock
        //ex = [7,[500,1456128,"0xa8e2eb03036ce394f20f4e3048130fe4a30b568f679a53d461e51d41a7e1f8e0"]]
        break;
      case 8: // NodeStats
        //ex = [8,[541,[17,0]]]
        break;
      case 9: // NodeHardware
        //ex = [9,[519,[[3642780.5625,4282087.625,5000156.8125,4768896.9375,3111033.34375,6077833.1875,4895427.03125,4898728.53125,5202526.0625,4990482.53125,3921587.25,4175173.25,4515314.46875,5592186.15625,4408536.8125,6322707.4375,5054165.53125,2356178.21875,5118044.84375,5163759.4375],[4539967.5,4268083.5,4365282.3125,4230096.5,4391524.1875,4323052.125,4324336.1875,4369030.21875,4399474.09375,4437320.15625,4584686.96875,4754311.125,4720657.5625,4509013.0625,4591593.90625,4671886.46875,4444222.375,4172537.84375,4499007.59375,4801142.34375],[1731598141178.5,1731598221187.8125,1731598301189.625,1731598381196.6875,1731598461198.875,1731598541208.1562,1731598621216.625,1731598701224.125,1731598781229.6875,1731598861235.9688,1731598941246.4375,1731599021273.0,1731599101296.2812,1731599181300.9062,1731599261303.5312,1731599341313.375,1731599421316.1875,1731599501321.625,1731599581326.8125,1731599661330.0625]]]]
        break;
      case 10: // TimeSync
      case 11: // AddedChain
        //ex = [11,["Kusama","0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",906]]
        break;
      case 12: // RemovedChain
      case 13: // SubscribedTo
        //ex = [13,"0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",10,1731600437616,1,[25778216,1731600432160,6238],2,[25778212,"0xec4ea83dbaa17721d733a30d2375bd292cb4f099f8756144c28ee6bf314d91b1"],22,{"version":{"list":[["1.16.1-835e0767fe8",517],["1.16.2-dba2dd59101",234],["1.16.0-87971b3e927",96],["1.16.1-a3b3f41abf8",8],["1.16.2-835e0767fe8",7],["1.15.2-d6f482d5593",7],["1.15.1-16b0fd09d9e",6],["1.15.0-743dc632fd6",6],["1.14.0-364961445b7",6],["1.14.1-7c4cd60da6d",3]],"other":13,"unknown":0},"target_os":{"list":[["linux",896],["macos",2],["18",1],["freebsd",1],["dirty",1]],"other":0,"unknown":2},"target_arch":{"list":[["x86_64",897],["aarch64",2],["refactor/notifications",1],["658dbf0d",1]],"other":0,"unknown":2},"cpu":{"list":[["AMD Ryzen 9 7950X3D 16-Core Processor",65],["AMD Ryzen 5 3600 6-Core Processor",38],["AMD Ryzen 9 7950X 16-Core Processor",32],["Intel(R) Xeon(R) E-2386G CPU @ 3.50GHz",32],["AMD Ryzen 9 5950X 16-Core Processor",30],["AMD Ryzen 5 5600X 6-Core Processor",26],["QEMU Virtual CPU version 2.5+",26],["AMD Ryzen 7 3700X 8-Core Processor",26],["AMD Ryzen 9 5900X 12-Core Processor",24],["Intel(R) Xeon(R) CPU E3-1270 v6 @ 3.80GHz",23]],"other":574,"unknown":7},"memory":{"list":[[[4,6],8],[[6,8],54],[[8,10],8],[[10,16],56],[[16,24],37],[[24,32],140],[[32,48],78],[[48,56],2],[[56,64],84],[[64,null],429]],"other":0,"unknown":7},"core_count":{"list":[[8,245],[6,208],[16,149],[4,136],[12,59],[32,28],[10,22],[24,12],[5,6],[14,5]],"other":26,"unknown":7},"linux_kernel":{"list":[["5.15.0-124-generic",78],["6.8.0-47-generic",67],["6.8.0-48-generic",67],["5.15.0-122-generic",46],["6.8.4-2-pve",34],["5.15.0-25-generic",33],["6.8.0-31-generic",27],["5.15.0-125-generic",27],["6.8.0-45-generic",25],["5.15.0-91-generic",21]],"other":471,"unknown":7},"linux_distro":{"list":[["Ubuntu 22.04.5 LTS",345],["Ubuntu 24.04.1 LTS",154],["Ubuntu 22.04.4 LTS",113],["Debian GNU/Linux 12 (bookworm)",76],["Ubuntu 20.04.6 LTS",53],["Ubuntu 22.04.3 LTS",47],["Ubuntu 22.04 LTS",24],["Ubuntu 22.04.2 LTS",24],["Ubuntu 22.04.1 LTS",14],["Debian GNU/Linux 11 (bullseye)",8]],"other":38,"unknown":7},"is_virtual_machine":{"list":[[false,672],[true,224]],"other":0,"unknown":7},"cpu_hashrate_score":{"list":[[[110,130],253],[[130,150],219],[[90,110],132],[[150,200],104],[[70,90],53],[[50,70],53],[[30,50],30],[[10,30],10]],"other":0,"unknown":49},"memory_memcpy_score":{"list":[[[0,10],2],[[10,30],64],[[30,50],123],[[50,70],145],[[70,90],146],[[90,110],229],[[110,130],105],[[130,150],28],[[150,200],10],[[300,400],2]],"other":0,"unknown":49},"disk_sequential_write_score":{"list":[[[0,10],14],[[10,30],46],[[30,50],48],[[50,70],47],[[70,90],43],[[90,110],55],[[110,130],28],[[130,150],43],[[150,200],136],[[200,300],175],[[300,400],133],[[400,500],49],[[500,null],37]],"other":0,"unknown":49},"disk_random_write_score":{"list":[[[0,10],16],[[10,30],51],[[30,50],42],[[50,70],76],[[70,90],48],[[90,110],57],[[110,130],45],[[130,150],50],[[150,200],129],[[200,300],191],[[300,400],120],[[400,500],18],[[500,null],11]],"other":0,"unknown":49}}]
        break;
      case 14: // UnsubscribedFrom
      case 15: // Pong
      case 16: // AfgFinalized
      case 17: // AfgReceivedPrevote
      case 18: // AfgReceivedPrecommit
      case 19: // AfgAuthoritySet
      case 20: // StaleNode
      case 21: // NodeIO
        //ex = [21,[519,[[53854932.0,50151720.0,46079590.0,48761044.0,53838450.0,50665500.0,46110188.0,48597588.0,53785108.0,51382572.0,48486772.0,47619156.0,53235184.0,55435560.0,48931804.0,46804000.0,52144310.0,54216244.0,49042480.0,46701570.0]]]]
        break;
      case 22: // ChainStatsUpdate
        //ex = [22,{"version":{"list":[["1.16.1-835e0767fe8",520],["1.16.2-dba2dd59101",234],["1.16.0-87971b3e927",96],["1.16.1-a3b3f41abf8",8],["1.16.2-835e0767fe8",7],["1.15.2-d6f482d5593",7],["1.15.1-16b0fd09d9e",6],["1.15.0-743dc632fd6",6],["1.14.0-364961445b7",6],["1.14.1-7c4cd60da6d",3]],"other":12,"unknown":0},"target_os":{"list":[["linux",899],["macos",2],["18",1],["freebsd",1]],"other":0,"unknown":2},"target_arch":{"list":[["x86_64",900],["aarch64",2],["refactor/notifications",1]],"other":0,"unknown":2},"cpu":{"list":[["AMD Ryzen 9 7950X3D 16-Core Processor",65],["AMD Ryzen 5 3600 6-Core Processor",38],["AMD Ryzen 9 7950X 16-Core Processor",32],["Intel(R) Xeon(R) E-2386G CPU @ 3.50GHz",32],["AMD Ryzen 9 5950X 16-Core Processor",30],["AMD Ryzen 5 5600X 6-Core Processor",27],["QEMU Virtual CPU version 2.5+",26],["AMD Ryzen 7 3700X 8-Core Processor",26],["AMD Ryzen 9 5900X 12-Core Processor",24],["Intel(R) Xeon(R) CPU E3-1270 v6 @ 3.80GHz",23]],"other":576,"unknown":6},"memory":{"list":[[[4,6],8],[[6,8],55],[[8,10],8],[[10,16],56],[[16,24],37],[[24,32],140],[[32,48],78],[[48,56],2],[[56,64],84],[[64,null],431]],"other":0,"unknown":6},"core_count":{"list":[[8,245],[6,209],[16,150],[4,136],[12,59],[32,28],[10,22],[24,12],[5,6],[14,5]],"other":27,"unknown":6},"linux_kernel":{"list":[["5.15.0-124-generic",78],["6.8.0-47-generic",67],["6.8.0-48-generic",67],["5.15.0-122-generic",47],["6.8.4-2-pve",34],["5.15.0-25-generic",33],["6.8.0-31-generic",27],["5.15.0-125-generic",27],["6.8.0-45-generic",25],["5.15.0-91-generic",21]],"other":473,"unknown":6},"linux_distro":{"list":[["Ubuntu 22.04.5 LTS",345],["Ubuntu 24.04.1 LTS",154],["Ubuntu 22.04.4 LTS",114],["Debian GNU/Linux 12 (bookworm)",77],["Ubuntu 20.04.6 LTS",53],["Ubuntu 22.04.3 LTS",47],["Ubuntu 22.04 LTS",24],["Ubuntu 22.04.2 LTS",24],["Ubuntu 22.04.1 LTS",15],["Debian GNU/Linux 11 (bullseye)",8]],"other":38,"unknown":6},"is_virtual_machine":{"list":[[false,675],[true,224]],"other":0,"unknown":6},"cpu_hashrate_score":{"list":[[[110,130],254],[[130,150],220],[[90,110],132],[[150,200],105],[[70,90],53],[[50,70],53],[[30,50],30],[[10,30],10]],"other":0,"unknown":48},"memory_memcpy_score":{"list":[[[0,10],2],[[10,30],64],[[30,50],124],[[50,70],145],[[70,90],146],[[90,110],229],[[110,130],107],[[130,150],28],[[150,200],10],[[300,400],2]],"other":0,"unknown":48},"disk_sequential_write_score":{"list":[[[0,10],14],[[10,30],47],[[30,50],48],[[50,70],47],[[70,90],43],[[90,110],55],[[110,130],28],[[130,150],43],[[150,200],136],[[200,300],175],[[300,400],135],[[400,500],50],[[500,null],36]],"other":0,"unknown":48},"disk_random_write_score":{"list":[[[0,10],16],[[10,30],52],[[30,50],42],[[50,70],76],[[70,90],48],[[90,110],57],[[110,130],45],[[130,150],50],[[150,200],130],[[200,300],191],[[300,400],121],[[400,500],18],[[500,null],11]],"other":0,"unknown":48}},6,[179,[25778181,"0x4ff464aea237f8d696874ef56c352a8e8484e6ea5691d774b4d785615eb42a17",5959,1731600210492,139]]]
        break;
      default:
        console.log('Unhandled message', message);
        break;
    }
  }
}
