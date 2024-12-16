
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
