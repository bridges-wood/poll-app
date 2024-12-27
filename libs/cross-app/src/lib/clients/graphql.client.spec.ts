/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import {
  AnyVariables,
  Client,
  CombinedError,
  Exchange,
  Operation,
} from '@urql/core';
import { ExecutionResult, GraphQLError, parse } from 'graphql';
import { fromValue, map, pipe, share, Source, take, toPromise } from 'wonka';
import { toResult } from '../../test/helpers';
import { GraphQLCrossAppClient } from './graphql.client';

describe('GraphQLCrossAppClient', () => {
  class TestGraphqlCrossAppClient extends GraphQLCrossAppClient {
    public override createExchanges(): Exchange[] {
      return super.createExchanges();
    }
  }

  let client: GraphQLCrossAppClient;
  const mockUrl = 'http://mock-url.com';
  const mockToken = 'mock-token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GraphQLCrossAppClient,
          useFactory: () => new TestGraphqlCrossAppClient(mockUrl),
        },
      ],
    }).compile();

    client = module.get<GraphQLCrossAppClient>(GraphQLCrossAppClient);
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  it('should set token when impersonating', () => {
    client.impersonating(mockToken);
    expect(client['token']).toBe(mockToken);
  });

  it('should not add token to operation when not impersonating', async () => {
    const mockOperation: Operation<any, AnyVariables> = {
      context: {
        url: 'http://localhost:3000/graphql',
        fetchOptions: {
          method: 'POST',
        },
        requestPolicy: 'cache-first',
      },
      key: 1,
      query: parse('query { test }'),
      variables: {},
      kind: 'query',
    };

    await handleRequest(
      false,
      mockOperation,
      mockOperation.context.fetchOptions,
    );
  });

  it('should add token to operation when impersonating', async () => {
    const mockOperation: Operation<any, AnyVariables> = {
      context: {
        url: 'http://localhost:3000/graphql',
        fetchOptions: {
          method: 'POST',
        },
        requestPolicy: 'cache-first',
      },
      key: 1,
      query: parse('query { test }'),
      variables: {},
      kind: 'query',
    };

    await handleRequest(true, mockOperation, {
      ...(mockOperation.context.fetchOptions || {}),
      headers: {
        authorization: 'Bearer mock-token',
      },
    });
  });

  it('should error for operation results with jwt expired error', async () => {
    const expiredError = new GraphQLError('jwt expired');
    const response = {
      status: 400,
      statusText: 'Bad Request',
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          errors: [expiredError],
        } as ExecutionResult),
      ),
    };

    jest.spyOn(global, 'fetch').mockResolvedValue(response as never);

    expect(client.query(parse('query {test}'), {})).rejects.toEqual(
      new CombinedError({
        graphQLErrors: [expiredError],
        response: response,
      }),
    );
  });

  it('should throw error if query fails', async () => {
    const mockError = new Error('Query failed');
    jest.spyOn(client['client'], 'query').mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({ error: mockError }),
    } as never);

    await expect(client.query('', {})).rejects.toThrow('Query failed');
  });

  it('should throw error if no data is returned from query', async () => {
    jest.spyOn(client['client'], 'query').mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({}),
    } as never);

    await expect(client.query('', {})).rejects.toThrow(
      'No data returned from query',
    );
  });

  it('should throw error if mutation fails', async () => {
    const mockError = new Error('Mutation failed');
    jest.spyOn(client['client'], 'mutation').mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({ error: mockError }),
    } as never);

    await expect(client.mutate('', {})).rejects.toThrow('Mutation failed');
  });

  it('should throw error if no data is returned from mutation', async () => {
    jest.spyOn(client['client'], 'mutation').mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({}),
    } as never);

    await expect(client.mutate('', {})).rejects.toThrow(
      'No data returned from mutation',
    );
  });

  it('should return data if query succeeds', async () => {
    const mockData = { data: 'mockData' };
    jest.spyOn(client['client'], 'query').mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({ data: mockData }),
    } as never);

    const result = await client.query('', {});
    expect(result).toBe(mockData);
  });

  it('should return data if mutation succeeds', async () => {
    const mockData = { data: 'mockData' };
    jest.spyOn(client['client'], 'mutation').mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({ data: mockData }),
    } as never);

    const result = await client.mutate('', {});
    expect(result).toBe(mockData);
  });

  const handleRequest = async (
    impersonate: boolean,
    mockOperation: Operation<any, AnyVariables>,
    expectedFetchOptions: any,
  ) => {
    if (impersonate) {
      client.impersonating(mockToken);
    }
    const authExchange: Exchange = (
      client as TestGraphqlCrossAppClient
    ).createExchanges()[0];

    const result = await pipe(
      fromValue(mockOperation),
      authExchange({
        forward: (op$: Source<Operation>) => pipe(op$, map(toResult), share),
        client: new Client({
          url: '/api',
          exchanges: [],
        }),
        dispatchDebug: jest.fn(),
      }),
      take(1),
      toPromise,
    );

    expect(result.operation.context['authAttempt']).toBe(false);
    expect(result.operation.context.fetchOptions).toEqual(expectedFetchOptions);
  };
});
