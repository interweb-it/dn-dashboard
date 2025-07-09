import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({ tableName: 'telemetry', timestamps: false })
export class Telemetry extends Model<Telemetry> {
  @PrimaryKey
  @Column({ type: DataType.STRING })
  ChainId!: string;

  @PrimaryKey
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  NodeId!: number;

  @Column({ type: DataType.STRING })
  NodeName!: string;

  @Column({ type: DataType.STRING })
  NodeImplementation!: string;

  @Column({ type: DataType.STRING })
  NodeVersion!: string;

  @Column({ type: DataType.STRING })
  Address!: string;

  @Column({ type: DataType.STRING })
  NetworkId!: string;

  @Column({ type: DataType.STRING })
  OperatingSystem!: string;

  @Column({ type: DataType.STRING })
  cpu!: string;

  @Column({ type: DataType.BIGINT })
  memory!: bigint;

  @Column({ type: DataType.INTEGER })
  core_count!: number;

  @Column({ type: DataType.STRING })
  linux_kernel!: string;

  @Column({ type: DataType.STRING })
  linux_distro!: string;

  @Column({ type: DataType.BOOLEAN })
  is_virtual_machine!: boolean;

  @Column({ type: DataType.INTEGER })
  cpu_hashrate_score!: number;

  @Column({ type: DataType.INTEGER })
  memory_memcpy_score!: number;

  @Column({ type: DataType.INTEGER })
  disk_sequential_write_score!: number;

  @Column({ type: DataType.INTEGER })
  disk_random_write_score!: number;

  @Column({ type: DataType.FLOAT })
  Latitude!: number;

  @Column({ type: DataType.FLOAT })
  Longitude!: number;

  @Column({ type: DataType.STRING })
  City!: string;

  @Column({ type: DataType.DATE })
  Timestamp!: Date;

  @Column({ type: DataType.STRING })
  chainId!: string;
}
