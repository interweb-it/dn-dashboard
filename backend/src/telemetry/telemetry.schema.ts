import {
  Field,
  ObjectType,
  Int,
  Float,
  Args,
  // ID,
  // Scalar,
  // InputType,
} from '@nestjs/graphql';
import { GraphQLScalarType, Kind } from 'graphql';

// Define BigInt Scalar Type
export const BigIntScalar = new GraphQLScalarType({
  name: 'BigInt',
  description: 'BigInt custom scalar type',
  parseValue(value: any): bigint {
    return BigInt(value); // from input
  },
  serialize(value: bigint): string {
    return value.toString(); // to output
  },
  parseLiteral(ast): bigint {
    if (ast.kind === Kind.INT) {
      return BigInt(ast.value);
    }
    return null;
  },
});

// NodeSysInfo Type
@ObjectType()
export class NodeSysInfo {
  @Field()
  cpu: string;

  @Field(() => BigIntScalar)
  memory: bigint;

  @Field(() => Int)
  core_count: number;

  @Field()
  linux_kernel: string;

  @Field()
  linux_distro: string;

  @Field()
  is_virtual_machine: boolean;
}

// ChainStats Type
// version: Maybe<Ranking<string>>;
// target_os: Maybe<Ranking<string>>;
// target_arch: Maybe<Ranking<string>>;

// cpu: Maybe<Ranking<string>>;
// core_count: Maybe<Ranking<number>>;
// memory: Maybe<Ranking<Range>>;
// is_virtual_machine: Maybe<Ranking<boolean>>;
// linux_distro: Maybe<Ranking<string>>;
// linux_kernel: Maybe<Ranking<string>>;

// cpu_hashrate_score: Maybe<Ranking<Range>>;
// memory_memcpy_score: Maybe<Ranking<Range>>;
// disk_sequential_write_score: Maybe<Ranking<Range>>;
// disk_random_write_score: Maybe<Ranking<Range>>;
// cpu_vendor: Maybe<Ranking<string>>;

@ObjectType()
export class ChainStats {
  // @Field(() => String)
  // version: string;

  // @Field(() => String)
  // target_os: string;

  // @Field(() => String)
  // target_arch: string;

  // @Field(() => String)
  // cpu: string;

  @Field(() => Int)
  cpu_hashrate_score: number;

  @Field(() => Int)
  memory_memcpy_score: number;

  @Field(() => Int)
  disk_sequential_write_score: number;

  @Field(() => Int)
  disk_random_write_score: number;
}

// BlockDetails Type
@ObjectType()
export class BlockDetails {
  @Field(() => BigIntScalar)
  BlockNumber: bigint;

  @Field()
  BlockHash: string;

  @Field(() => Int)
  Milliseconds: number;

  @Field(() => BigIntScalar)
  Timestamp: bigint;

  @Field(() => Int)
  PropagationTime: number;
}

// NodeDetails Type
@ObjectType()
export class NodeDetails {
  @Field()
  NodeName: string;

  @Field()
  NodeImplementation: string;

  @Field()
  NodeVersion: string;

  @Field()
  Address: string;

  @Field()
  NetworkId: string;

  @Field()
  OperatingSystem: string;

  @Field(() => NodeSysInfo)
  NodeSysInfo: NodeSysInfo;

  @Field(() => ChainStats)
  ChainStats: ChainStats;
}

// NodeDetailsX Type
@ObjectType()
export class NodeDetailsX {
  @Field(() => Int)
  NodeId: number;

  @Field(() => NodeDetails)
  NodeDetails: NodeDetails;

  @Field(() => [[Int]])
  NodeStats: number[][];

  @Field(() => [[Int]])
  NodeIO: number[][];

  @Field(() => [[Float]])
  NodeHardware: number[][];

  @Field(() => BlockDetails)
  BlockDetails: BlockDetails;

  @Field()
  NodeLocation: string;

  @Field()
  Timestamp: string;
}

// Queries
@ObjectType()
export class Query {
  @Field(() => [NodeDetailsX], { nullable: 'itemsAndList' })
  telemetry(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Args('chainId', { type: () => String }) chainId: string,
  ): NodeDetailsX[] {
    return [];
  }

  @Field(() => NodeDetailsX, { nullable: true })
  telemetryByName(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Args('chainId', { type: () => String }) chainId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Args('name', { type: () => String }) name: string,
  ): NodeDetailsX {
    return {} as NodeDetailsX;
  }

  @Field(() => NodeDetailsX, { nullable: true })
  telemetryByNetworkId(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Args('chainId', { type: () => String }) chainId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Args('networkId', { type: () => String }) networkId: string,
  ): NodeDetailsX {
    return {} as NodeDetailsX;
  }
}
