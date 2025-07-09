import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'cohorts', timestamps: false })
export class Cohort extends Model<Cohort> {
  @Column({ type: DataType.STRING, primaryKey: true })
  chainId!: string;

  @Column({ type: DataType.STRING, primaryKey: true })
  cohortId!: string;

  // selected nodes
  @Column({ type: DataType.JSON })
  selected!: string[];

  // backup nodes
  @Column({ type: DataType.JSON })
  backups!: string[];

  // nominators
  @Column({ type: DataType.JSON })
  nominators!: string[];

  // term
  @Column({ type: DataType.STRING })
  term_start!: string;

  @Column({ type: DataType.STRING })
  term_end!: string;
}
