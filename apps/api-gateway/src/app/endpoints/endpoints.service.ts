import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { EndpointLoader } from './loaders';
import { AddEndpointArgs } from './models/add-endpoint.args';
import { AddEndpointResult } from './models/add-endpoint.result';
import { Endpoint } from './models/endpoint.model';
import { LoadedEndpoint } from './models/loaded-endpoint.model';
import { ReloadAllEndpointsResult } from './models/reload-all-endpoints.result';
import { RemoveEndpointResult } from './models/remove-endpoint.result';

@Injectable()
export class EndpointsService implements OnApplicationShutdown {
  private readonly logger = new Logger(EndpointsService.name);

  constructor(private endpointLoader: EndpointLoader) {}

  getAllLoadedEndpoints(): LoadedEndpoint[] {
    const endpoints = this.endpointLoader.getEndpoints();
    return endpoints;
  }

  async addEndpoint(args: AddEndpointArgs): Promise<AddEndpointResult> {
    // Check if endpoint already exists with the same URL
    const existingEndpoint = this.endpointLoader
      .getEndpoints()
      .find((e) => e.name === args.name);
    if (existingEndpoint) {
      // Overwrite the existing endpoint
      await this.endpointLoader.removeEndpoint({ name: args.name });
    }

    const addedEndpoint = await this.endpointLoader.addEndpoint(args);
    return {
      endpoint: addedEndpoint,
      success: true,
    };
  }

  async removeEndpoint(name: Endpoint['name']): Promise<RemoveEndpointResult> {
    try {
      await this.endpointLoader.removeEndpoint({ name });
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
      };
    }
  }

  async reloadAllEndpoints(): Promise<ReloadAllEndpointsResult> {
    try {
      await this.endpointLoader.reload();
      return {
        success: true,
        loadedEndpoints: this.endpointLoader.getEndpoints(),
      };
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
        loadedEndpoints: this.endpointLoader.getEndpoints(),
      };
    }
  }

  async onApplicationShutdown(_signal?: string) {
    this.logger.log(`Received shutdown signal: ${_signal}`);
    await this.endpointLoader.unRegisterAllEndpoints();
  }
}
