import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { isAsyncIterable } from '@graphql-tools/utils';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GraphQLSchema, parse } from 'graphql';
import { ConfigService } from '../config/config.service';
import { Endpoint } from '../endpoints/models/endpoint.model';
import { LoadedEndpoint } from '../endpoints/models/loaded-endpoint.model';
import { SchemaStitcher } from './schema-stitcher';

@Injectable()
export class SchemaLoader {
  private readonly logger = new Logger(SchemaLoader.name);
  private schema: GraphQLSchema | null = null;
  private endpoints: Endpoint[];
  private loadedEndpoints: LoadedEndpoint[] = [];

  constructor(
    private configService: ConfigService,
    private schemaStitcher: SchemaStitcher
  ) {
    this.endpoints = this.configService.getEndpoints();
  }

  load(): Promise<GraphQLSchema> {
    if (!this.schema) {
      return this.reload();
    }
    return Promise.resolve(this.schema);
  }

  getEndpoints(): LoadedEndpoint[] {
    return this.loadedEndpoints;
  }

  async addEndpoint(endpoint: Endpoint, reload?: true): Promise<void> {
    this.endpoints.push(endpoint);
    if (reload) {
      await this.reload();
    }
  }

  async removeEndpoint(endpoint: Endpoint, reload?: true): Promise<void> {
    const index = this.endpoints.findIndex((e) => e.url === endpoint.url);
    if (index > -1) {
      this.endpoints.splice(index, 1);
    }
    if (reload) {
      await this.reload();
    }
  }

  async reload(): Promise<GraphQLSchema> {
    const loadedEndpoints: LoadedEndpoint[] = [];
    this.logger.log(`Attempting to load ${this.endpoints.length} endpoint(s)`);
    await Promise.all(
      this.endpoints.map(async (endpoint) => {
        const sdl = await this.loadEndpoint(endpoint);
        loadedEndpoints.push({ ...endpoint, sdl, lastReload: new Date() });
      })
    );

    this.loadedEndpoints = loadedEndpoints;
    this.logger.log(
      `Successfully loaded ${loadedEndpoints.length} endpoint(s)`
    );
    this.schema = await this.schemaStitcher.stitch(loadedEndpoints);
    this.logger.log(`Successfully stitched schema`);

    return this.schema;
  }

  async loadEndpoint(endpoint: Endpoint): Promise<string> {
    const fetcher = buildHTTPExecutor({
      endpoint: endpoint.url,
      timeout: 300,
    });
    const result = await fetcher({
      document: parse(`{ _sdl }`),
    });
    if (isAsyncIterable(result)) {
      throw new Error('Expected executor to return a single result');
    }
    return result.data._sdl;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async autoRefresh() {
    this.logger.log('Auto-reloading schema');
    await this.reload();
  }
}
