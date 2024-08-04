import { Logger } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EndpointsService } from './endpoints.service';
import { AddEndpointArgs } from './models/add-endpoint.args';
import { AddEndpointResult } from './models/add-endpoint.result';
import { LoadedEndpoint } from './models/loaded-endpoint.model';
import { ReloadAllEndpointsResult } from './models/reload-all-endpoints.result';
import { RemoveEndpointResult } from './models/remove-endpoint.result';

@Resolver()
export class EndpointsResolver {
  private readonly logger = new Logger(EndpointsResolver.name);
  constructor(private endpointsService: EndpointsService) {}

  @Query((returns) => [LoadedEndpoint], {
    description: 'Get all endpoints currently loaded by the gateway',
  })
  endpoints(): LoadedEndpoint[] {
    return this.endpointsService.getAllLoadedEndpoints();
  }

  @Mutation((returns) => AddEndpointResult, {
    description: 'Add a new endpoint to the gateway',
  })
  addEndpoint(@Args('args') args: AddEndpointArgs): Promise<AddEndpointResult> {
    this.logger.debug(`Adding endpoint ${args.url}`);
    return this.endpointsService.addEndpoint(args);
  }

  @Mutation((returns) => RemoveEndpointResult, {
    description: 'Remove an endpoint from the gateway',
  })
  removeEndpoint(
    @Args('name', {
      description: 'The name of the endpoint to remove from the gateway',
    })
    name: string,
  ): Promise<RemoveEndpointResult> {
    this.logger.debug(`Removing endpoint ${name}`);
    return this.endpointsService.removeEndpoint(name);
  }

  @Mutation((returns) => ReloadAllEndpointsResult, {
    description: 'Reload the schema of all endpoints loaded by the gateway',
  })
  reloadAllEndpoints(): Promise<ReloadAllEndpointsResult> {
    this.logger.debug(`Reloading all endpoints`);
    return this.endpointsService.reloadAllEndpoints();
  }
}
