import { Injectable, Logger } from '@nestjs/common';
import { EndpointLoader } from './endpoint-loader';
import { AddEndpointArgs } from './models/add-endpoint.args';
import { AddEndpointResult } from './models/add-endpoint.result';
import { LoadedEndpoint } from './models/loaded-endpoint.model';
import { ReloadAllEndpointsResult } from './models/reload-all-endpoints.result';
import { RemoveEndpointResult } from './models/remove-endpoint.result';

@Injectable()
export class EndpointsService {
  private readonly logger = new Logger(EndpointsService.name);

  constructor(private endpointLoader: EndpointLoader) {}

  getAllLoadedEndpoints(): LoadedEndpoint[] {
    const endpoints = this.endpointLoader.getEndpoints();
    return endpoints;
  }

  async addEndpoint(args: AddEndpointArgs): Promise<AddEndpointResult> {
    try {
      // Check if endpoint already exists with the same URL
      const existingEndpoint = this.endpointLoader
        .getEndpoints()
        .find((e) => e.url === args.url);
      if (existingEndpoint) {
        return {
          endpoint: existingEndpoint,
          success: false,
        };
      }

      await this.endpointLoader.addEndpoint({ ...args });
      return {
        endpoint: this.endpointLoader
          .getEndpoints()
          .find((e) => e.url === args.url),
        success: true,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
      };
    }
  }

  async removeEndpoint(url: string): Promise<RemoveEndpointResult> {
    try {
      await this.endpointLoader.removeEndpoint({ url });
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
      };
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
      };
    }
  }
}
