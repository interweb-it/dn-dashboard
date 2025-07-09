import { ChainStats, NodeHardware, NodeIO, Timestamp } from "../substrate-telemetry/types";
// import { NodeDetailsX } from "../types";
import { Maybe } from "../substrate-telemetry/helpers";

/**
 * @deprecated - we don't use this anymore, it would dox the node
 */
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

/**
 * a simplified type alias for the NodeStats type from the substrate-telemetry package
 */
export type NodeStatsX = {
  PeerCount: number;
  TransactionCount: number;
};

/**
 * a simplified type alias for the BlockDetails type from the substrate-telemetry package
 */
export interface BlockDetailsX {
  BlockNumber: number;
  BlockHash: string;
  Milliseconds: number;
  Timestamp: number;
  PropagationTime: Maybe<number>;
}

/**
 * a simplified type alias for the NodeLocation type from the substrate-telemetry package
 */
export interface NodeLocationX {
  Latitude: number;
  Longitude: number;
  City: string;
}

/**
 * a simplified type alias for the NodeSysInfo type from the substrate-telemetry package
 */
export interface NodeSysInfoX {
  cpu: string;
  memory: number;
  core_count: number;
  linux_kernel: string;
  linux_distro: string;
  is_virtual_machine: boolean;
}

/**
 * a simplified type alias for the NodeDetails type from the substrate-telemetry package
 */
export interface NodeDetailsX {
  NodeName: string;
  TelemetryName: string;
  NodeImplementation: string;
  NodeVersion: string;
  // NetworkId: Maybe<string>,
  Field4: string;
  NetworkId: string;
  // Address: Maybe<string>;
  OperatingSystem: string;
  CpuArchitecture: string;
  TargetEnv: string;
  NodeSysInfo: NodeSysInfoX;
  ChainStats: ChainStats;
}

/**
 * A simplified type alias for the AddedNodeMessage type from the substrate-telemetry package
 */
export interface AddedNodeMessageX {
  NodeId: number;
  NodeDetails: NodeDetailsX;
  NodeStats: NodeStatsX;
  NodeIO: NodeIO;
  NodeHardware: NodeHardware;
  BlockDetails: BlockDetailsX;
  NodeLocation: NodeLocationX;
  IPGeo?: IPGeo;
  Timestamp: Maybe<Timestamp>;
}

// Shared node/cohort types for use across backend, workers, frontend, etc.

export type NodeStatus = 'Active' | 'Graduated' | 'Pending' | 'Removed';
export type ChainTerm = 'start' | 'end';

export interface INodeBase {
  identity: string;
  stash: string;
  commission: number;
  telemetryX: any; // Use NodeDetailsX if available in shared types
  telemetry: string;
}

export interface INode extends INodeBase {
  status: NodeStatus;
}

export interface ITerm {
  start: string;
  end: string;
}

/**
 * API response for a cohort
 * https://nodes.web3.foundation/api/{cohortId}/{chainId}
 */
export interface ICohortData {
  backups: INodeBase[];
  nominators: string[];
  selected: INode[];
  statuses: NodeStatus[];
  term: ITerm;
}

export type TChainData = Record<number, ICohortData>;
