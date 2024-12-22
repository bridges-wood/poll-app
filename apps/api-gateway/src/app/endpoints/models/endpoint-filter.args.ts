import { InputType } from '@nestjs/graphql';
import { Searchable } from '@org/graphql/search';
import { LoadedEndpoint } from './loaded-endpoint.model';

@InputType({
  description: 'Filter for endpoints loaded by the gateway.',
})
export class EndpointFilter extends Searchable(LoadedEndpoint) {}
