import { AsyncExecutor } from '@graphql-tools/utils';
import { Injectable, OnModuleDestroy, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BaseLogger } from '@org/log';
import { backOff } from 'exponential-backoff';
import { OperationTypeNode, parse } from 'graphql';
import { isAsyncIterable } from 'graphql-yoga';
import { defaultTo } from 'lodash';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';
import { ExecutorFactory } from '../../executors/executor-factory';
import { Endpoint } from '../models/endpoint.model';
import { LoadedEndpoint } from '../models/loaded-endpoint.model';
import { NotFoundError } from '@org/errors';

@Injectable()
export abstract class EndpointLoader implements OnModuleDestroy {
  private readonly DEBOUNCE_INTERVAL = 600;

  public loadedEndpoints$ = new BehaviorSubject<LoadedEndpoint[]>([]);
  protected endpoints$ = new BehaviorSubject<Endpoint[]>([]);
  private readonly endpointSubscription: Subscription;

  constructor(
    protected readonly executorFactory: ExecutorFactory,
    protected readonly logger: BaseLogger,
    @Optional() initialEndpoints: Endpoint[] = [],
  ) {
    this.logger.setContext(EndpointLoader.name);
    this.endpoints$.next(initialEndpoints);
    this.endpointSubscription = this.endpoints$
      .pipe(debounceTime(this.DEBOUNCE_INTERVAL))
      .subscribe((endpoints) => this.reload(endpoints));
  }
  onModuleDestroy() {
    this.endpointSubscription.unsubscribe();
  }

  public getEndpoints(): LoadedEndpoint[] {
    return this.loadedEndpoints$.value;
  }

  public async addEndpoint(endpoint: Endpoint): Promise<Endpoint> {
    await this.loadEndpoint.bind(this)(endpoint);
    this.endpoints$.next([...this.endpoints$.value, endpoint]);

    return endpoint;
  }

  public async removeEndpoint(
    endpoint: Pick<Endpoint, 'name'>,
  ): Promise<Endpoint | undefined> {
    const index = this.endpoints$.value.findIndex(
      (e) => e.name === endpoint.name,
    );
    if (index === -1) throw new NotFoundError(`Endpoint not found: '${endpoint.name}'`);

    const endpoints = [...this.endpoints$.value];
    const removed = endpoints.splice(index, 1)[0];
    this.endpoints$.next(endpoints);
    return removed;
  }

  public async unRegisterAllEndpoints(): Promise<void> {
    this.logger.log('⛓️‍💥 Unregistering all endpoints...');
    const endpoints = this.endpoints$.value;

    await Promise.all(
      endpoints.map((endpoint) => this.unRegisterEndpoint.bind(this)(endpoint)),
    );

    this.endpoints$.next([]);
    this.logger.log('⛓️‍💥 Unregistered all endpoints');
  }

  private async unRegisterEndpoint(endpoint: Endpoint): Promise<boolean> {
    const fetcher = this.executorFactory.getExecutor(endpoint.url);

    this.logger.debug(`Unregistering endpoint ${endpoint.name}`);
    try {
      const result = await fetcher({
        document: parse(`mutation { _reRegister }`),
      });

      if (isAsyncIterable(result)) {
        throw new Error('Expected executor to return a single result');
      }

      const success = result?.data?._reRegister;
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
      endpoints.map(async (endpoint) =>
        loadedEndpoints.push({
          ...endpoint,
          sdl: await this.loadEndpoint(endpoint),
          lastReload: new Date(),
        }),
      ),
    );

    this.logger.log(
      `Successfully loaded ${loadedEndpoints.length} endpoint(s)`,
    );
    this.loadedEndpoints$.next(loadedEndpoints);
  }

  protected abstract loadEndpoint(endpoint: Endpoint): Promise<string>;

  protected async fetchSDL(
    fetcher: AsyncExecutor,
    endpoint: Endpoint,
  ): Promise<string> {
    try {
      const result = await backOff(
        () =>
          fetcher({
            document: parse('{ _service { _sdl } }'),
            operationType: OperationTypeNode.QUERY,
          }),
        { numOfAttempts: 10 },
      );

      if (isAsyncIterable(result)) {
        throw new Error('Expected executor to return a single result');
      }

      const sdl = result?.data?._service?._sdl;
      if (!sdl) {
        this.logger.debug(`Received: ${JSON.stringify(result)}`);
        throw new Error('No SDL found in response');
      }

      return sdl;
    } catch (error) {
      this.logger.error(
        `Failed to load endpoint ${endpoint.name}: ${error.message}`,
      );
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async autoReload() {
    this.logger.log('🤖 Auto-reloading schema');
    await this.reload(this.endpoints$.value);
  }
}
