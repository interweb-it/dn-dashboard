export interface IEra {
  /**
   * The index number of the era
   */
  index: number;
  /**
   * The blocknumber of the start of the era
   */
  start: number;
}

// system.account: FrameSystemAccountInfo
export interface IAccount {
  nonce: number;
  consumers: number;
  providers: number;
  sufficients: number;
  data: {
    free: bigint;
    reserved: bigint;
    frozen: bigint;
    flags: bigint;
  }
}

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
  chainId: string;
  stash: string;
  dateHour: string;
  active?: boolean;
  blocked?: boolean;
  own: bigint;
  total: bigint;
  others: IExposureOther[];
}
export interface IValidator {
  address: string;
  identity?: string;
  commission: number;
  blocked: boolean;
  balance?: number;
  exposure?: IExposure; // should be an array of IExposure?
  active?: boolean;
}

export interface IExposureOverview {
  total: bigint;
  own: bigint;
  pageCount: number;
  nominatorCount: number;
  // others: IExposureOther[];
}

export interface ICohort {
  chainId: string;
  cohortId: string;
  selected: ISelectedNode[];
  backups?: IBackupNode[];
  nominators?: string[];
  term: {
    start: string;
    end: string;
  };
}

export interface ISelectedNode {
  identity: string;
  stash: string;
  status: string;
  telemetry: string;
}
export interface IBackupNode {
  identity: string;
  stash: string;
  telemetry: string;
}

export type IStatus = Record<string, string>;

export interface ITerm {
  start: string;
  end: string;
}

export interface INodeData {
  chainId: string;
  cohortId: string;
  selected: ISelectedNode[];
  backups?: IBackupNode[];
  statused: IStatus;
  term: ITerm;
}
