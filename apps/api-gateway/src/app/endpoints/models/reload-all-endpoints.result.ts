import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ReloadAllEndpointsResult {
  @Field()
  success: boolean;
}
