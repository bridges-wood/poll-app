import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { isAsyncIterable } from '@graphql-tools/utils';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { backOff } from 'exponential-backoff';
import { parse } from 'graphql';
import { EndpointLoader } from '.';
import { ConfigService } from '../../config/config.service';
import { Endpoint } from '../models/endpoint.model';

@Injectable()
export class LocalEndpointLoader extends EndpointLoader {
  constructor(private readonly configService: ConfigService) {
    super(new Logger(LocalEndpointLoader.name), configService.getEndpoints());
  }

  override async loadEndpoint(endpoint: Endpoint): Promise<string | null> {
    const fetcher = buildHTTPExecutor({
      endpoint: endpoint.url,
      timeout: 300,
    });

    try {
      const result = await backOff(
        () => fetcher({ document: parse(`{ _sdl }`) }),
        { numOfAttempts: 10 },
      );
      if (isAsyncIterable(result)) {
        throw new Error('Expected executor to return a single result');
      }

      const sdl = result?.data?._sdl;
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
