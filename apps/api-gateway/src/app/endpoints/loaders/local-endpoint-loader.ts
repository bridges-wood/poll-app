import { Inject, Injectable } from '@nestjs/common';
import { BaseLogger } from '@org/log';
import { EndpointLoader } from '.';
import EndpointsConfigFactory, {
  EndpointsConfig,
} from '../../config/factories/endpoints.config.factory';
import { ExecutorFactory } from '../../executors/executor-factory';
import { Endpoint } from '../models/endpoint.model';

@Injectable()
export class LocalEndpointLoader extends EndpointLoader {
  constructor(
    @Inject(EndpointsConfigFactory.KEY)
    endpointsConfig: EndpointsConfig,
    executorFactory: ExecutorFactory,
    protected override readonly logger: BaseLogger,
  ) {
    super(executorFactory, logger, endpointsConfig.endpoints);
    this.logger.setContext(LocalEndpointLoader.name);
  }

  public override async removeEndpoint(
    endpoint: Pick<Endpoint, 'name'>,
  ): Promise<Endpoint | undefined> {
    const removed = await super.removeEndpoint(endpoint);
    if (!removed) return;

    this.executorFactory.invalidateExecutor(removed.url);
    return removed;
  }

  override async loadEndpoint(endpoint: Endpoint): Promise<string> {
    const fetcher = this.executorFactory.getExecutor(endpoint.url);

    return this.fetchSDL(fetcher, endpoint);
  }
}
