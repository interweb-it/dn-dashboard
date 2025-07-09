
export interface BlockDetailsX {
  BlockNumber: BlockNumber,
  BlockHash: string,
  Milliseconds: number,
  Timestamp: Timestamp,
  PropagationTime?: number,
}

export interface ISelectedNode {
  identity: string;
  stash: string;
  status: string;
}

export interface IBackupNode {
  identity: string;
  stash: string;
}

export interface IValidatorStats {
  chainId: string;
  stash: string;
  dateHour: string;
  active: boolean;
  updatedAt: string;
  commission: number;
  blocked: boolean;
  nomDn: number;
  nomNon: number;
  nomValueDn: bigint;
  nomValueNon: bigint;
  exposureDn: bigint;
  exposureNon: bigint;
}

// TODO move this to utils
export interface IExposureItem {
  who: string;
  value: number;
}
export interface IExposure {
  total: number;
  own: number;
  pageCount: number;
  others: IExposureItem[]
}

export interface INominator {
  address: string;
  balance: number;
  identity?: string;
  identityInfo?: any;
  locks?: any[];
  pooled?: any;
  nominations?: any;
}

export interface INode {
  identity: string;
  stash: string;
  status: string;
}
