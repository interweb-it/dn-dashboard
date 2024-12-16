import { defineStore } from 'pinia'
import type { Maybe } from '../pages/substrate-telemetry/helpers'
import type {
  NodeDetails,
  NodeStats,
  NodeIO,
  NodeHardware,
  BlockDetails,
  NodeLocation,
  Timestamp,
  NodeSysInfo
} from '../pages/substrate-telemetry/types'

export interface AddedNodeMessageX {
  NodeId: number
  NodeDetails: NodeDetailsX
  NodeStats: NodeStats
  NodeIO: NodeIO
  NodeHardware: NodeHardware
  BlockDetails: BlockDetails
  NodeLocation: Maybe<NodeLocation>
  Timestamp: Maybe<Timestamp>
}
interface RemovedNodeMessageX {
  NodeId: number
}
export interface NodeDetailsX {
  NodeName: string
  NodeImplementation: string
  NodeVersion: string
  Address: Maybe<string>
  // NetworkId: Maybe<string>,
  NetworkId: string,
  OperatingSystem: string,
  CpuArchitecture: string,
  _undefined: undefined
  NodeSysInfo: NodeSysInfo
}

// import type { Message, AddedNodeMessage, RemovedNodeMessage } from '../pages/substrate-telemetry/feed'

export const useNodeStore = defineStore({
  id: 'nodeStore',
  state: () => ({
    chainId: 'kusama',
    search: '',
    linesPerPage: 10,
    tab: 'selected', // selected, backup, nominators
    nodes: new Map<string, any>(),
  }),
  // getters: {
  //   nodes: (state) => state.nodes,
  // },
  actions: {
    setSearch(search: string) {
      this.search = search
    },
    addNode(node: AddedNodeMessageX) {
      // console.log('Adding node', node);
      if (!(this.nodes instanceof Map)) {
        this.nodes = new Map(); // Reinitialize if something goes wrong
      }
      const networkId = node.NodeDetails.NetworkId
      // console.log('Adding node', networkId);
      this.nodes.set(networkId, node);
    },
    removeNode(node: any) {
      //const nodex = parseRemovedNodeMessage(node)
      // this.nodes.delete(stash)
    },
  },
})
