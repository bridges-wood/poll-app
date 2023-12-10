import { Field, ObjectType } from '@nestjs/graphql';
import { Endpoint } from './endpoint.model';

@ObjectType()
export class AddEndpointResult {
  @Field()
  success: boolean;

  @Field((type) => Endpoint, { nullable: true })
  endpoint?: Endpoint;
}
