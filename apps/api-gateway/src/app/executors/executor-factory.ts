import {
  AsyncExecutor,
  ExecutionRequest,
  ExecutionResult,
} from '@graphql-tools/utils';
import { Inject, Injectable } from '@nestjs/common';
import HmacConfigFactory, { HmacConfig } from '@org/config/hmac.config.factory';
import {
  computeHmacSignature,
  HMAC_SIGNATURE_EXTENSION,
} from '@org/graphql/plugins';
import { BaseLogger } from '@org/log';
import { TrustedRequestExtensions } from '@org/typings';
import { fetch } from '@whatwg-node/fetch';
import { OperationTypeNode, print } from 'graphql';
import { createClient, RequestParams } from 'graphql-sse';
import { GraphQLParams } from 'graphql-yoga';

@Injectable()
export class ExecutorFactory {
  private executorCache = new Map<string, AsyncExecutor>();

  constructor(
    @Inject(HmacConfigFactory.KEY)
    private readonly hmacConfig: HmacConfig,
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
      extensions: baseExtensions = {},
      context,
      operationType,
    }) => {
      const query = print(document);

      const extensionsWithAuth = this.addAuthExtensions(baseExtensions, {
        context,
      });

      const extensions = this.addSignatureExtensions(extensionsWithAuth, {
        document,
        variables,
      });

      // TODO cleanup extension enrichment

      switch (operationType) {
        case OperationTypeNode.SUBSCRIPTION:
          return this.buildSseExecutor(url, {
            query,
            variables,
            operationName,
            extensions,
          });
        case OperationTypeNode.QUERY:
        case OperationTypeNode.MUTATION:
          return this.buildFetchBasedExecutor(url, {
            query,
            variables,
            operationName,
            extensions,
          });
        default:
          throw new Error(
            `Unsupported operation type: ${operationType} for executor at ${url}`,
          );
      }
    };

    this.addExecutorToCache(url, executor);
    return executor;
  }
  addSignatureExtensions(
    extensions: ExecutionRequest['extensions'],
    {
      document,
      variables,
    }: Pick<ExecutionRequest, 'document' | 'variables'> &
      Partial<ExecutionRequest>,
  ): ExecutionRequest['extensions'] {
    const query = print(document);
    return {
      ...extensions,
      [HMAC_SIGNATURE_EXTENSION]: computeHmacSignature(
        { query, variables, extensions },
        this.hmacConfig.secret,
      ), // ! This has to be done here because the stitched schema is implemented with custom resolvers, not plugins
    };
  }

  private buildSseExecutor(
    url: string,
    { query, variables, operationName, extensions }: RequestParams,
  ): AsyncIterable<ExecutionResult> {
    const client = createClient({
      url: url.toString(),
      fetchFn: fetch,
      retryAttempts: 0, // Disable retries to surface errors immediately
      headers: {
        accept: 'text/event-stream',
      },
    });

    return client.iterate(
      {
        query,
        variables,
        operationName,
        extensions,
      },
      {
        connecting: () => {
          this.logger.debug(`Connecting to SSE endpoint: ${url}`);
        },
        connected: () => {
          this.logger.debug(`Connected to SSE endpoint: ${url}`);
        },
      },
    );
  }

  private async buildFetchBasedExecutor(
    url: string,
    { query, variables, operationName, extensions }: GraphQLParams,
  ): Promise<ExecutionResult> {
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
        extensions,
      }),
    });

    return fetchResult.json();
  }

  private addAuthExtensions(
    extensions: ExecutionRequest['extensions'],
    { context }: Pick<ExecutionRequest, 'context'> & Partial<ExecutionRequest>,
  ): ExecutionRequest['extensions'] {
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
