
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

export interface INominationStats {
  chainId: string;
  stash: string;
  datehour: string;
  active: boolean;
  commission: number;
  nom_dn: number;
  nom_non: number;
  nom_value_dn: number;
  nom_value_non: number;
  exposure_dn: number;
  exposure_non: number;
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
