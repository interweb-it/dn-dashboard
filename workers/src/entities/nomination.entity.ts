// import { Table, Column, Model, DataType } from 'sequelize-typescript';

export interface INomStats {
  chainId: string;
  stash: string;
  dateHour: string; // YYYY-MM-DD-HH
  active?: number;
  commission?: number;
  nomDn: number;
  nomNon: number;
  nomValueDn: bigint;
  nomValueNon: bigint;
  exposureDn: bigint;
  exposureNon: bigint;
}

export interface INomination {
  chainId: string;
  nominatorId: string;
  targetId: string;
  dateHour: string;
  account: {
    data: {
      feeFrozen: number;
      free: number;
      miscFrozen: number;
    }
  }
}
/*
| chainId | validator | YYYY.MM.DD.HH | active | nomDn | nomNon | exposure_dn | exposure_non |
|---------|-----------|---------------|--------|--------|---------|-------------|--------------|
| kusama  | 5kQeWYk   | 2024.01.01.00 | 1      | 100    | 1000    | 1000        | 1000         |
| kusama  | 5kQeWYk   | 2024.01.01.01 | 1      | 100    | 1000    | 1000        | 1000         |
| kusama  | 5kQeWYk   | 2024.01.01.02 | 1      | 100    | 1000    | 1000        | 1000         |
| kusama  | 5kQeWYk   | 2024.01.01.03 | 1      | 100    | 1000    | 1000        | 1000         |
| kusama  | 5kQeWYk   | 2024.01.01.04 | 1      | 100    | 1000    | 1000        | 1000         |
*/

// @Table({ tableName: 'nominations' })
// export class Nomination extends Model {
//   @Column({ primaryKey: true })
//   declare chainId: string;

//   @Column({ primaryKey: true })
//   declare stash: string;

//   @Column({ primaryKey: true })
//   declare dateHour: string;

//   @Column(DataType.INTEGER)
//   declare active: number;

//   @Column(DataType.INTEGER)
//   declare commission: number;

//   @Column({ type: DataType.INTEGER, comment: 'nominator count for DN' })
//   declare nomDn: number;

//   @Column({ type: DataType.INTEGER, comment: 'nominator count for non-DN' })
//   declare nomNon: number;

//   @Column({ type: DataType.INTEGER, comment: 'nomination value for DN' })
//   declare nomValueDn: number;

//   @Column({ type: DataType.INTEGER, comment: 'nomination value for non-DN' })
//   declare nomValueNon: number;

//   @Column({ type: DataType.INTEGER, comment: 'exposure value for DN' })
//   declare exposure_dn: number;

//   @Column({ type: DataType.INTEGER, comment: 'exposure value for non-DN' })
//   declare exposure_non: number;
// }
