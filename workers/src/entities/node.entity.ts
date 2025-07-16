// import { Table, Column, Model, DataType } from 'sequelize-typescript';
// import { ITelemetryX } from '@dn/common/dn';

export interface INode {
  chainId: string;
  stash: string;
  identity: string;
  commission: number;
  // status: string;
  // telemetry?: ITelemetryX;
  // nominators?: string[];
  // cohorts?: string[];
}

// @Table({ tableName: 'nodes' })
// export class Node extends Model {
//   @Column({ primaryKey: true })
//   declare chainId: string;

//   @Column({ primaryKey: true })
//   declare stash: string;

//   @Column(DataType.STRING)
//   declare identity: string;

//   @Column(DataType.FLOAT)
//   declare commission: number;
// }
