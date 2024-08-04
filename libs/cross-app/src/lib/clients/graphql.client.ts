import { Injectable, Logger } from '@nestjs/common';
import {
  AnyVariables,
  Client,
  DocumentInput,
  OperationContext,
  fetchExchange,
} from '@urql/core';
import { authExchange } from '@urql/exchange-auth';
import { CrossAppClient } from './base.client';

@Injectable()
export class GraphQLCrossAppClient implements CrossAppClient {
  private logger = new Logger(GraphQLCrossAppClient.name);
  private client: Client;
  private token: string | undefined;

  constructor(public url: string) {
    this.logger.debug(`Creating client for URL: ${url}`);
    this.client = new Client({
      exchanges: [
        authExchange(async (utils) => {
          const token = this.token;

          return {
            addAuthToOperation: (operation) => {
              if (!token) return operation;
              return utils.appendHeaders(operation, {
                Authorization: `Bearer ${token}`,
              });
            },
            didAuthError: (error) => {
              return error.graphQLErrors.some(
                (e) => e.message === 'jwt expired',
              );
            },
            async refreshAuth() {},
          };
        }),
        fetchExchange,
      ],
      url,
      requestPolicy: 'network-only',
    });
  }

  impersonating(token: string): CrossAppClient {
    this.logger.debug(`Impersonating as user with token: ${token}`);
    this.token = token;
    return this as CrossAppClient;
  }

  async query<Data = any, Variables extends AnyVariables = AnyVariables>(
    payload: DocumentInput<Data, AnyVariables>,
    variables: Variables,
    context?: Partial<OperationContext>,
  ): Promise<Data> {
    const result = await this.client.query<Data, Variables>(
      payload,
      variables,
      context,
    );

    if (result.error) {
      throw result.error;
    }

    if (!result.data) {
      throw new Error('No data returned from query');
    }

    return result.data;
  }

  async mutate<Data = any, Variables extends AnyVariables = AnyVariables>(
    payload: DocumentInput<Data, AnyVariables>,
    variables: Variables,
    context?: Partial<OperationContext>,
  ): Promise<Data> {
    const result = await this.client.mutation<Data, Variables>(
      payload,
      variables,
      context,
    );

    if (result.error) {
      this.logger.error(result.error.message);
      throw result.error;
    }

    if (!result.data) {
      throw new Error('No data returned from mutation');
    }

    return result.data;
  }
}
