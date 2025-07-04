import { defineStore } from 'pinia'
import type { Maybe } from '../utils/substrate-telemetry/helpers'
import type {
  NodeDetails,
  NodeStats,
  NodeIO,
  NodeHardware,
  BlockDetails,
  NodeLocation,
  Timestamp,
  NodeSysInfo
} from '../utils/substrate-telemetry/types'
import type { IExposure } from '../utils/types'

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

export const useNodeStore = defineStore('nodeStore', {
  state: () => ({
    chainId: '',
    cohortIds: ['2-1', '2', '1'],
    cohortId: '2-1',
    selected: [],
    backups: [],
    nominators: [],
    telemetry: [],
    validators: [],
    search: '',
    page: 1,
    linesPerPage: 10,
    tab: 'selected', // selected, backup, nominators
    nodes: new Map<string, any>(),
    currentExposure: {} as IExposure
  }),
  // getters: {
  //   nodes: (state) => state.nodes,
  // },
  actions: {
    setChainId(chainId: string) {
      this.chainId = chainId
      this.selected = []
      this.backups = []
      this.nominators = []
      this.telemetry = []
      this.validators = []
      this.nodes.clear()
      this.page = 1
    },
    setSearch(search: string) {
      this.search = search
    },
    setCohortId(cohortId: string) {
      // if cohort is different from current, reset the store
      if (cohortId !== this.cohortId) {
        this.cohortId = cohortId
        this.selected = []
        this.backups = []
        this.nominators = []
        this.telemetry = []
      }
    },
    async addNode(node: AddedNodeMessageX) {
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
    setCurrentExposure(exposure: IExposure) {
      this.currentExposure = exposure
    }
  },
})
