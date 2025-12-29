import { AsyncExecutor, ExecutionResult } from '@graphql-tools/utils';
import { Injectable } from '@nestjs/common';
import { BaseLogger } from '@org/log';
import { fetch } from '@whatwg-node/fetch';
import { OperationTypeNode, print } from 'graphql';
import { createClient, RequestParams } from 'graphql-sse';
import { GraphQLParams } from 'graphql-yoga';
import { ExtensionVisitor } from '../extensions/extension.visitor';

@Injectable()
export class ExecutorFactory {
  private executorCache = new Map<string, AsyncExecutor>();

  constructor(
    private readonly extensionVisitors: ExtensionVisitor[],
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

      // Apply extension visitors to enrich extensions
      const extensions = this.extensionVisitors.reduce(
        (exts, visitor) =>
          visitor.visit(exts, {
            document,
            variables,
            operationName,
            context,
            operationType,
          }),
        baseExtensions,
      );

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

    return client.iterate({
      query,
      variables,
      operationName,
      extensions,
    });
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

  private addExecutorToCache(url: string, executor: AsyncExecutor): void {
    this.executorCache.set(url, executor);
  }

  private executorExistsInCache(url: string): boolean {
    return this.executorCache.has(url);
  }
}
