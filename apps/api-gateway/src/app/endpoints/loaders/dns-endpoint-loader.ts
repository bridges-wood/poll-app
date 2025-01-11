import { Injectable } from '@nestjs/common';
import { BaseLogger } from '@org/log';
import { resolveSrv } from 'dns/promises';
import { EndpointLoader } from '.';
import { ExecutorFactory } from '../../executors/executor-factory';
import { Endpoint } from '../models/endpoint.model';

@Injectable()
export class DnsEndpointLoader extends EndpointLoader {
  constructor(
    executorFactory: ExecutorFactory,
    protected override readonly logger: BaseLogger,
  ) {
    super(executorFactory, logger);
    this.logger.setContext(DnsEndpointLoader.name);
  }

  override async loadEndpoint(endpoint: Endpoint): Promise<string> {
    const service = await this.resolveService(endpoint.name);
    const fetcher = this.executorFactory.getExecutor(`https://${service}`);

    return this.fetchSDL(fetcher, endpoint);
  }

  private async resolveService(serviceName: string): Promise<string> {
    const records = await resolveSrv(`${serviceName}.service.consul`);
    if (records.length === 0) {
      throw new Error(`No SRV records found for ${serviceName}`);
    }
    return records[0].name + ':' + records[0].port;
  }
}
