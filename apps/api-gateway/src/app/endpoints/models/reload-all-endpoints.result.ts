import { Field, ObjectType } from '@nestjs/graphql';
import { LoadedEndpoint } from './loaded-endpoint.model';

@ObjectType()
export class ReloadAllEndpointsResult {
  @Field({ description: 'Whether the endpoints were reloaded successfully' })
  success: boolean;

  @Field((returns) => [LoadedEndpoint], {
    description: 'The currently loaded endpoints',
  })
  loadedEndpoints: LoadedEndpoint[];
}
