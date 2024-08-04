import { Logger } from '@nestjs/common';
import { defaultTo } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { Endpoint } from '../models/endpoint.model';
import { LoadedEndpoint } from '../models/loaded-endpoint.model';

export abstract class EndpointLoader {
  public loadedEndpoints$ = new BehaviorSubject<LoadedEndpoint[]>([]);
  protected endpoints$ = new BehaviorSubject<Endpoint[]>([]);

  constructor(
    protected readonly logger: Logger,
    private readonly initialEndpoints: Endpoint[] = [],
  ) {
    this.endpoints$.next(initialEndpoints);
    this.endpoints$.subscribe((endpoints) => this.reload(endpoints));
  }

  public getEndpoints(): LoadedEndpoint[] {
    return this.loadedEndpoints$.value;
  }

  public async addEndpoint(endpoint: Endpoint): Promise<Endpoint> {
    // Attempt to load the endpoint
    const sdl = await this.loadEndpoint(endpoint);
    if (sdl) {
      this.endpoints$.next([...this.endpoints$.value, endpoint]);
    }

    return endpoint;
  }

  public async removeEndpoint(endpoint: Pick<Endpoint, 'name'>): Promise<void> {
    const index = this.endpoints$.value.findIndex(
      (e) => e.name === endpoint.name,
    );
    if (index !== -1) {
      const endpoints = [...this.endpoints$.value];
      endpoints.splice(index, 1);
      this.endpoints$.next(endpoints);
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
