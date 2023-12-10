import { Injectable, Logger } from '@nestjs/common';
import { SchemaLoader } from '../schema/schema-loader';
import { AddEndpointArgs } from './models/add-endpoint.args';
import { AddEndpointResult } from './models/add-endpoint.result';
import { LoadedEndpoint } from './models/loaded-endpoint.model';
import { ReloadAllEndpointsResult } from './models/reload-all-endpoints.result';
import { RemoveEndpointResult } from './models/remove-endpoint.result';

@Injectable()
export class EndpointsService {
  private readonly logger = new Logger(EndpointsService.name);

  constructor(private schemaLoader: SchemaLoader) {}

  getAllLoadedEndpoints(): LoadedEndpoint[] {
    const endpoints = this.schemaLoader.getEndpoints();
    return endpoints;
  }

  async addEndpoint(args: AddEndpointArgs): Promise<AddEndpointResult> {
    try {
      await this.schemaLoader.addEndpoint({ ...args }, true);
      return {
        endpoint: this.schemaLoader
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
      await this.schemaLoader.removeEndpoint({ url }, true);
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
      await this.schemaLoader.reload();
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
