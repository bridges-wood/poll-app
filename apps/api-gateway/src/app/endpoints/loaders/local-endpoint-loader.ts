import { ExecutionRequest, isAsyncIterable } from '@graphql-tools/utils';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  computeHmacSignature,
  HMAC_SIGNATURE_EXTENSION,
} from '@org/graphql/plugins';
import { backOff } from 'exponential-backoff';
import { parse, print } from 'graphql';
import { EndpointLoader } from '.';
import { ConfigService } from '../../config/config.service';
import { ExecutorFactory } from '../../executors/executor-factory';
import { Endpoint } from '../models/endpoint.model';

@Injectable()
export class LocalEndpointLoader extends EndpointLoader {
  private static readonly INTROSPECTION_QUERY = parse(`{ _service { _sdl } }`);

  private readonly introspectionExecutionRequest: ExecutionRequest;

  constructor(
    configService: ConfigService,
    private executorFactory: ExecutorFactory,
  ) {
    super(new Logger(LocalEndpointLoader.name), configService.getEndpoints());

    this.introspectionExecutionRequest = {
      document: LocalEndpointLoader.INTROSPECTION_QUERY,
      extensions: {
        [HMAC_SIGNATURE_EXTENSION]: computeHmacSignature(
          {
            // Note: Need to use `print` here to ensure that the query is consistently stringified
            query: print(LocalEndpointLoader.INTROSPECTION_QUERY),
          },
          'secret',
        ),
      },
    };
  }

  override async loadEndpoint(endpoint: Endpoint): Promise<string | null> {
    const fetcher = this.executorFactory.createExecutor(endpoint.url);

    try {
      const result = await backOff(
        () => fetcher(this.introspectionExecutionRequest),
        { numOfAttempts: 10 },
      );
      if (isAsyncIterable(result)) {
        throw new Error('Expected executor to return a single result');
      }

      const sdl = result?.data?._service._sdl;
      if (!sdl) {
        this.logger.debug(result);
        throw new Error('No SDL found in response');
      }

      return sdl;
    } catch (error) {
      this.logger.error(
        `Failed to load endpoint ${endpoint.name}: ${error.message}`,
      );
      this.logger.error(error);
      return null;
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async autoReload() {
    this.logger.log('🤖 Auto-reloading schema');
    await this.reload(this.endpoints$.value);
  }
}
