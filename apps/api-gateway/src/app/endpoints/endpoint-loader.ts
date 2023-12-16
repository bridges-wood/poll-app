import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { isAsyncIterable } from '@graphql-tools/utils';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { parse } from 'graphql';
import _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { Endpoint } from '../endpoints/models/endpoint.model';
import { LoadedEndpoint } from '../endpoints/models/loaded-endpoint.model';

@Injectable()
export class EndpointLoader {
  private readonly logger = new Logger(EndpointLoader.name);
  private endpoints$: BehaviorSubject<Endpoint[]> = new BehaviorSubject<
    Endpoint[]
  >([]);
  public loadedEndpoints$: BehaviorSubject<LoadedEndpoint[]> =
    new BehaviorSubject<LoadedEndpoint[]>([]);

  constructor(private configService: ConfigService) {
    this.endpoints$.next(this.configService.getEndpoints());
    this.endpoints$.subscribe((endpoints) => this.reload(endpoints));
  }

  getEndpoints(): LoadedEndpoint[] {
    return this.loadedEndpoints$.value;
  }

  async addEndpoint(endpoint: Endpoint): Promise<void> {
    this.endpoints$.next([...this.endpoints$.value, endpoint]);
  }

  async removeEndpoint(endpoint: Endpoint): Promise<void> {
    const index = this.endpoints$.value.findIndex(
      (e) => e.url === endpoint.url
    );
    if (index > -1) {
      const endpoints = [...this.endpoints$.value];
      endpoints.splice(index, 1);
      this.endpoints$.next(endpoints);
    }
  }

  async reload(endpoints?: Endpoint[]): Promise<void> {
    endpoints = _.defaultTo(endpoints, this.endpoints$.value);
    if (endpoints.length === 0) {
      this.logger.warn('No endpoints to load');
      this.loadedEndpoints$.next([]);
      return;
    }

    const loadedEndpoints: LoadedEndpoint[] = [];
    this.logger.log(`Attempting to load ${endpoints.length} endpoint(s)`);
    await Promise.all(
      endpoints.map(async (endpoint) => {
        const sdl = await this.loadEndpoint(endpoint);
        loadedEndpoints.push({ ...endpoint, sdl, lastReload: new Date() });
      })
    );

    this.loadedEndpoints$.next(loadedEndpoints);
    this.logger.log(
      `Successfully loaded ${loadedEndpoints.length} endpoint(s)`
    );
  }

  private async loadEndpoint(endpoint: Endpoint): Promise<string> {
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
  private async autoReload() {
    this.logger.log('Auto-reloading schema');
    await this.reload(this.endpoints$.value);
  }
}
