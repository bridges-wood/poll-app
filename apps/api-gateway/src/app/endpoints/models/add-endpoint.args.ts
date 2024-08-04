import { InputType, OmitType } from '@nestjs/graphql';
import { Endpoint } from './endpoint.model';

@InputType({
  description:
    'Arguments to add a new endpoint to the gateway. Intended to be compatible with [Hashicorp Consul](https://developer.hashicorp.com/consul).',
})
export class AddEndpointArgs extends OmitType(
  Endpoint,
  [] as const,
  InputType,
) {}
