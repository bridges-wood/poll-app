import { AsyncExecutor } from '@graphql-tools/utils';
import { Injectable } from '@nestjs/common';
import {
  computeHmacSignature,
  HMAC_SIGNATURE_EXTENSION,
} from '@org/graphql/plugins';
import { BaseLogger } from '@org/log';
import { DecodedIdToken, TrustedRequestExtensions } from '@org/typings';
import { fetch } from '@whatwg-node/fetch';
import { print } from 'graphql';
import { ConfigService } from '../config/config.service';

@Injectable()
export class ExecutorFactory {
  private executorCache = new Map<string, AsyncExecutor>();

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: BaseLogger,
  ) {
    this.logger.setContext(ExecutorFactory.name);
  }

  public getExecutor(url: string): AsyncExecutor {
    if (this.executorExistsInCache(url)) {
      this.logger.debug(`Returning cached executor for endpoint: ${url}`);
      return this.executorCache.get(url) as AsyncExecutor;
    }

    return this.initializeExecutor(url);
  }

  public invalidateExecutor(url: string): void {
    this.logger.debug(`Invalidating executor for endpoint: ${url}`);
    this.executorCache.delete(url);
  }

  private initializeExecutor(url: string): AsyncExecutor {
    this.logger.debug(`Creating executor for endpoint: ${url}`);
    const executor: AsyncExecutor = async ({
      document,
      variables,
      operationName,
      extensions,
      context,
    }) => {
      const query = print(document);
      const completeExtensions = this.addAuthExtensions(extensions, context);

      const fetchResult = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
          operationName,
          extensions: {
            ...completeExtensions,
            [HMAC_SIGNATURE_EXTENSION]: computeHmacSignature(
              { query, variables, extensions: completeExtensions },
              this.configService.HMACSecret,
            ), // ! This has to be done here because the stitched schema is implemented with custom resolvers, not plugins
          },
        }),
      });
      return fetchResult.json();
    };

    this.addExecutorToCache(url, executor);
    return executor;
  }

  private addAuthExtensions(
    extensions: Record<string, unknown> | undefined,
    context: { jwt?: { payload: DecodedIdToken } } | undefined,
  ) {
    const jwt = context?.jwt;

    if (jwt) {
      // Mark the request as trusted and add the user data
      return {
        ...extensions,
        trusted: true,
        sub: jwt.payload.sub,
        roles: jwt.payload.roles,
      } as TrustedRequestExtensions;
    } else {
      return extensions;
    }
  }

  private addExecutorToCache(url: string, executor: AsyncExecutor): void {
    this.executorCache.set(url, executor);
  }

  private executorExistsInCache(url: string): boolean {
    return this.executorCache.has(url);
  }
}
