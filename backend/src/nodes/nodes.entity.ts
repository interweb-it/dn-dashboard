import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'nodes', timestamps: false })
export class NodeModel extends Model<Node> {
  @Column({ type: DataType.STRING, primaryKey: true })
  chainId!: string;

  @Column({ type: DataType.STRING, primaryKey: true })
  cohortId!: string;

  @Column({ type: DataType.STRING })
  stash!: string;

  @Column({ type: DataType.STRING })
  identity!: string;

  @Column({ type: DataType.FLOAT })
  commission!: number;

  @Column({ type: DataType.STRING })
  status!: string; // 'selected' | 'backup' | etc.

  // @Column({ type: DataType.STRING })
  // telemetry!: string;

  // @Column({ type: DataType.JSON })
  // nominators!: string[];

  // @Column({ type: DataType.STRING })
  // termStart!: string;

  // @Column({ type: DataType.STRING })
  // termEnd!: string;
}
