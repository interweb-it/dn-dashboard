// import { Table, Column, Model, DataType } from 'sequelize-typescript';

export interface INominator {
  chainId: string;
  stash: string;
  // dateHour: string; // YYYY.MM.DD.HH
  free: number;
  reserved: number;
  miscFrozen: number;
  targets: string[];
}

// @Table({ tableName: 'nominators' })
// export class Nominator extends Model {
//   @Column({ primaryKey: true })
//   declare chainId: string;

//   @Column({ primaryKey: true })
//   declare stash: string;

//   // @Column({ primaryKey: true })
//   // dateHour!: string;

//   @Column({ type: DataType.BIGINT })
//   declare free: number;

//   @Column({ type: DataType.BIGINT })
//   declare reserved: number;

//   @Column({ type: DataType.BIGINT })
//   declare miscFrozen: number;

//   @Column(DataType.JSON)
//   declare targets: string[];
// }
