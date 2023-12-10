import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RemoveEndpointResult {
  @Field()
  success: boolean;
}
