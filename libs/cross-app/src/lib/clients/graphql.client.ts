import { Injectable, Logger } from '@nestjs/common';
import {
  AnyVariables,
  Client,
  DocumentInput,
  Exchange,
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
      exchanges: this.createExchanges(),
      url,
      requestPolicy: 'network-only',
    });
  }

  protected createExchanges(): Exchange[] {
    return [
      authExchange(async (utils) => {
        return {
          addAuthToOperation: (operation) => {
            if (!this.token) return operation;
            return utils.appendHeaders(operation, {
              authorization: `Bearer ${this.token}`,
            });
          },
          didAuthError: (error) => {
            return error.graphQLErrors.some(
              (e) => e.message === 'jwt expired'
            );
          },
          async refreshAuth() {
            // This is where you could refresh your token
            return;
          },
        };
      }),
      fetchExchange,
    ];
  }

  impersonating(token: string): GraphQLCrossAppClient {
    this.logger.debug(`Impersonating as user with token: ${token}`);
    this.token = token;
    return this as GraphQLCrossAppClient;
  }

  async query<Data = unknown, Variables extends AnyVariables = AnyVariables>(
    payload: DocumentInput<Data, AnyVariables>,
    variables: Variables,
    context?: Partial<OperationContext>,
  ): Promise<Data> {
    const result = await this.client
      .query<Data, Variables>(payload, variables, context)
      .toPromise();

    if (result.error) {
      throw result.error;
    }

    if (!result.data) {
      throw new Error('No data returned from query');
    }

    return result.data;
  }

  async mutate<Data = unknown, Variables extends AnyVariables = AnyVariables>(
    payload: DocumentInput<Data, AnyVariables>,
    variables: Variables,
    context?: Partial<OperationContext>,
  ): Promise<Data> {
    const result = await this.client
      .mutation<Data, Variables>(payload, variables, context)
      .toPromise();

    if (result.error) {
      throw result.error;
    }

    if (!result.data) {
      throw new Error('No data returned from mutation');
    }

    return result.data;
  }
}
