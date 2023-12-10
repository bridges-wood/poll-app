import { Field, ObjectType } from '@nestjs/graphql';
import { Endpoint } from './endpoint.model';

@ObjectType({
  description: 'An endpoint that has been loaded into the API Gateway',
})
export class LoadedEndpoint extends Endpoint {
  @Field({ description: 'The GraphQL SDL of the endpoint' })
  sdl: string;

  @Field({ description: 'The date and time the endpoint was last loaded' })
  lastReload: Date;
}
