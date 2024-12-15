import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { Logger } from '@nestjs/common';
import { parse } from 'graphql';
import { isAsyncIterable } from 'graphql-yoga';
import { defaultTo } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { Endpoint } from '../models/endpoint.model';
import { LoadedEndpoint } from '../models/loaded-endpoint.model';

export abstract class EndpointLoader {
  public loadedEndpoints$ = new BehaviorSubject<LoadedEndpoint[]>([]);
  protected endpoints$ = new BehaviorSubject<Endpoint[]>([]);

  constructor(
    protected readonly logger: Logger,
    initialEndpoints: Endpoint[] = [],
  ) {
    this.endpoints$.next(initialEndpoints);
    this.endpoints$.subscribe((endpoints) => this.reload(endpoints));
  }

  public getEndpoints(): LoadedEndpoint[] {
    return this.loadedEndpoints$.value;
  }

  public async addEndpoint(endpoint: Endpoint): Promise<Endpoint> {
    // Attempt to load the endpoint
    const sdl = await this.loadEndpoint.bind(this)(endpoint);
    if (sdl) {
      this.endpoints$.next([...this.endpoints$.value, endpoint]);
    }

    return endpoint;
  }

  public async removeEndpoint(
    endpoint: Pick<Endpoint, 'name'>,
  ): Promise<Endpoint | undefined> {
    const index = this.endpoints$.value.findIndex(
      (e) => e.name === endpoint.name,
    );
    if (index === -1) return;

    const endpoints = [...this.endpoints$.value];
    const removed = endpoints.splice(index, 1)[0];
    this.endpoints$.next(endpoints);
    return removed;
  }

  public async unRegisterAllEndpoints(): Promise<void> {
    this.logger.log('⛓️‍💥 Unregistering all endpoints...');
    const endpoints = this.endpoints$.value;

    await Promise.all(
      endpoints.map((endpoint) => this.unRegisterEndpoint(endpoint)),
    );
    this.logger.log('⛓️‍💥 Unregistered all endpoints');
  }

  private async unRegisterEndpoint(endpoint: Endpoint): Promise<boolean> {
    const fetcher = buildHTTPExecutor({
      endpoint: endpoint.url,
      timeout: 300,
    });

    this.logger.debug(`Unregistering endpoint ${endpoint.name}`);
    try {
      const result = await fetcher({
        document: parse(`mutation { _reRegister}`),
      });

      if (isAsyncIterable(result)) {
        throw new Error('Expected executor to return a single result');
      }

      const success = result?.data?._unRegister;
      if (!success) throw new Error('Failed to unregister');

      this.logger.debug(
        `✅ Successfully unregistered endpoint ${endpoint.name}`,
      );

      return success;
    } catch (error) {
      this.logger.error(
        `Failed to unregister endpoint ${endpoint.name}: ${error.message}`,
      );
      this.logger.error(error);
      return false;
    }
  }

  public async reload(endpoints?: Endpoint[]): Promise<void> {
    endpoints = defaultTo(endpoints, this.endpoints$.value);
    if (endpoints.length === 0) {
      this.logger.warn('No endpoints to load, skipping');
      this.loadedEndpoints$.next([]);
      return;
    }

    const loadedEndpoints: LoadedEndpoint[] = [];
    this.logger.log(`Attempting to load ${endpoints.length} endpoint(s)`);
    await Promise.all(
      endpoints.map(async (endpoint) => {
        const sdl = await this.loadEndpoint(endpoint);
        if (sdl)
          loadedEndpoints.push({ ...endpoint, sdl, lastReload: new Date() });
      }),
    );

    this.logger.log(
      `Successfully loaded ${loadedEndpoints.length} endpoint(s)`,
    );
    this.loadedEndpoints$.next(loadedEndpoints);
  }

  protected abstract loadEndpoint(endpoint: Endpoint): Promise<string | null>;
}
