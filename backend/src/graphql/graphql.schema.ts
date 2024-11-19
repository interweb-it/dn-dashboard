import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Node {
  @Field()
  name: string;

  @Field()
  network: string;

  @Field()
  version: string;
}
