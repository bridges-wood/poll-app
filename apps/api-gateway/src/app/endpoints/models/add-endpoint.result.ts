import { Field, ObjectType } from '@nestjs/graphql';
import { Endpoint } from './endpoint.model';

@ObjectType()
export class AddEndpointResult {
  @Field({ description: 'Whether the endpoint was added successfully' })
  success: boolean;

  @Field((type) => Endpoint, {
    nullable: true,
    description: 'The endpoint that was added',
  })
  endpoint?: Endpoint;
}
