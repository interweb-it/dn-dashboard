import { Table, Column, Model } from 'sequelize-typescript';

export interface INomination {
  chainId: string;
  stash: string;
  dateHour: string; // YYYY-MM-DD-HH
  active: number;
  commission: number;
  nomDn: number;
  nomNon: number;
  nomValueDn: number;
  nomValueNon: number;
  exposureDn: number;
  exposureNon: number;
}
/*
| chainId | validator | YYYY.MM.DD.HH | active | nom_dn | nom_non | exposure_dn | exposure_non |
|---------|-----------|---------------|--------|--------|---------|-------------|--------------|
| kusama  | 5kQeWYk   | 2024.01.01.00 | 1      | 100    | 1000    | 1000        | 1000         |
| kusama  | 5kQeWYk   | 2024.01.01.01 | 1      | 100    | 1000    | 1000        | 1000         |
| kusama  | 5kQeWYk   | 2024.01.01.02 | 1      | 100    | 1000    | 1000        | 1000         |
| kusama  | 5kQeWYk   | 2024.01.01.03 | 1      | 100    | 1000    | 1000        | 1000         |
| kusama  | 5kQeWYk   | 2024.01.01.04 | 1      | 100    | 1000    | 1000        | 1000         |
*/

@Table
export class Nomination extends Model {
  @Column({ primaryKey: true })
  chainId: string; // primary key

  @Column({ primaryKey: true })
  stash: string; // primary key

  @Column({ primaryKey: true })
  datehour: string; // primary key

  @Column
  active: number;

  @Column
  commission: number;

  @Column({ comment: 'nominator count for DN' })
  nom_dn: number;

  @Column({ comment: 'nominator count for non-DN' })
  nom_non: number;

  @Column({ comment: 'nomination value for DN' })
  nom_value_dn: number;

  @Column({ comment: 'nomination value for non-DN' })
  nom_value_non: number;

  @Column({ comment: 'exposure value for DN' })
  exposure_dn: number;

  @Column({ comment: 'exposure value for non-DN' })
  exposure_non: number;
}
