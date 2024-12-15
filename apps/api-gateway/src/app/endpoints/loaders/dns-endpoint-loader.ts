import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { AsyncExecutor, isAsyncIterable } from '@graphql-tools/utils';
import { Injectable, Logger } from '@nestjs/common';
import { resolveSrv } from 'dns/promises';
import { parse } from 'graphql';
import { EndpointLoader } from '.';
import { ExecutorFactory } from '../../executors/executor-factory';
import { Endpoint } from '../models/endpoint.model';

@Injectable()
export class DnsEndpointLoader extends EndpointLoader {
  constructor(executorFactory: ExecutorFactory) {
    super(new Logger(DnsEndpointLoader.name), executorFactory);
  }

  protected async loadEndpoint(endpoint: Endpoint): Promise<string> {
    const fetcher: AsyncExecutor = async (args) => {
      const service = await this.resolveService(endpoint.name);
      const executor = buildHTTPExecutor({
        endpoint: `https://${service}`,
        timeout: 300,
      });
      return executor(args);
    };

    const result = await fetcher({ document: parse('{ _sdl }') });
    if (isAsyncIterable(result)) {
      throw new Error('Expected executor to return a single result');
    }

    const sdl = result?.data?._sdl;
    if (!sdl) {
      this.logger.error(`Failed to load endpoint ${endpoint.name}`);
      this.logger.debug(`Received: ${JSON.stringify(result)}`);
      throw new Error(
        `Expected executor to return an SDL for the endpoint ${endpoint.name}`,
      );
    }
    return sdl;
  }

  private async resolveService(serviceName: string): Promise<string> {
    const records = await resolveSrv(`${serviceName}.service.consul`);
    if (records.length === 0) {
      throw new Error(`No SRV records found for ${serviceName}`);
    }
    return records[0].name + ':' + records[0].port;
  }
}
