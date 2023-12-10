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

  @Query((returns) => [LoadedEndpoint])
  endpoints(): LoadedEndpoint[] {
    return this.endpointsService.getAllLoadedEndpoints();
  }

  @Mutation((returns) => AddEndpointResult)
  addEndpoint(@Args('args') args: AddEndpointArgs): Promise<AddEndpointResult> {
    this.logger.debug(`Adding endpoint ${args.url}`);
    return this.endpointsService.addEndpoint(args);
  }

  @Mutation((returns) => RemoveEndpointResult)
  removeEndpoint(@Args('url') url: string): Promise<RemoveEndpointResult> {
    this.logger.debug(`Removing endpoint ${url}`);
    return this.endpointsService.removeEndpoint(url);
  }

  @Mutation((returns) => ReloadAllEndpointsResult)
  reloadAllEndpoints(): Promise<ReloadAllEndpointsResult> {
    this.logger.debug(`Reloading all endpoints`);
    return this.endpointsService.reloadAllEndpoints();
  }
}
