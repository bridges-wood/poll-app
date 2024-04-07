import {
  ApolloClient,
  ApolloQueryResult,
  DocumentNode,
  InMemoryCache,
  NormalizedCacheObject,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client/core';
import { Injectable, Logger } from '@nestjs/common';
import { CrossAppClient } from './base.client';

@Injectable()
export class GraphQLCrossAppClient implements CrossAppClient {
  private logger = new Logger(GraphQLCrossAppClient.name);
  private client: ApolloClient<NormalizedCacheObject>;
  private token: string | undefined;

  constructor(url: string) {
    const cache = new InMemoryCache();
    this.client = new ApolloClient({ cache, uri: url });
  }

  impersonating(token: string): GraphQLCrossAppClient {
    this.logger.debug(`Impersonating as user with token: ${token}`);
    this.token = token;
    return this;
  }

  async send<R>(
    payload: DocumentNode | TypedDocumentNode<any, OperationVariables>,
    options?: {
      variables?: OperationVariables;
      headers?: Record<string, string>;
    },
  ): Promise<ApolloQueryResult<R>> {
    return this.client.query({
      query: payload,
      variables: options?.variables,
      context: {
        headers: options?.headers,
      },
    });
  }
}
