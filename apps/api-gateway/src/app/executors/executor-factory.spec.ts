import { ExecutionResult } from '@graphql-tools/utils';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import HmacConfigFactory from '@org/config/hmac.config.factory';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { DecodedIdToken } from '@org/typings';
import { fetch } from '@whatwg-node/fetch';
import { OperationTypeNode, parse, print } from 'graphql';
import { ExecutorFactory } from './executor-factory';

jest.mock('@whatwg-node/fetch', () => ({
  fetch: jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue({ data: { hello: 'world' } }),
  }),
}));
jest.mock('@org/graphql/plugins', () => {
  const original = jest.requireActual('@org/graphql/plugins');
  return {
    ...original,
    computeHmacSignature: jest.fn().mockReturnValue('test-signature'),
  };
});
jest.mock('graphql-sse', () => ({
  createClient: jest.fn().mockReturnValue({
    iterate: jest.fn().mockReturnValue(
      (async function* () {
        yield { data: { hello: 'world' } };
      })(),
    ),
  }),
}));

describe('ExecutorFactory', () => {
  let executorFactory: ExecutorFactory;
  let logger: BaseLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(HmacConfigFactory)],
      providers: [
        ExecutorFactory,
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
      ],
    }).compile();

    executorFactory = module.get<ExecutorFactory>(ExecutorFactory);
    logger = module.get<BaseLogger>(BaseLogger);
  });

  it('should be defined', () => {
    expect(executorFactory).toBeDefined();
  });

  it('should create an sse executor if operation is subscription', async () => {
    const url = 'http://example.com/graphql';
    const executor = executorFactory.getExecutor(url);

    expect(executor).toBeDefined();

    const query = parse(`{ hello }`);

    const result = await executor({
      document: query,
      operationType: OperationTypeNode.SUBSCRIPTION,
    });

    expect(result[Symbol.asyncIterator]).toBeDefined();

    // Simulate async iteration
    const asyncIterator = result as AsyncIterable<ExecutionResult>;
    const iterator = asyncIterator[Symbol.asyncIterator]();

    const firstResult = await iterator.next();
    expect(firstResult.value).toEqual({ data: { hello: 'world' } });
  });

  it('should create a new executor if not cached', () => {
    const url = 'http://example.com/graphql';
    const executor = executorFactory.getExecutor(url);

    expect(executor).toBeDefined();
    expect(logger.debug).toHaveBeenCalledWith(
      `Creating executor for endpoint: ${url}`,
    );
  });

  it('should return a working executor', async () => {
    const url = 'http://example.com/graphql';
    const executor = executorFactory.getExecutor(url);

    const query = parse(`{ hello }`);

    const result = await executor({
      document: query,
      operationType: OperationTypeNode.QUERY,
    });

    expect(result).toEqual({ data: { hello: 'world' } });
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: print(query),
        variables: undefined,
        operationName: undefined,
        extensions: {
          'hmac-signature': 'test-signature',
        },
      }),
    });
  });

  it('should throw error for unsupported operation type', () => {
    const url = 'http://example.com/graphql';
    const executor = executorFactory.getExecutor(url);

    const query = parse(`{ hello }`);

    expect(() =>
      executor({
        document: query,
        operationType: 'INVALID_OPERATION' as OperationTypeNode,
      }),
    ).rejects.toThrow(
      `Unsupported operation type: INVALID_OPERATION for executor at ${url}`,
    );
  });

  it('should return cached executor if exists', () => {
    const url = 'http://example.com/graphql';
    const executor = executorFactory.getExecutor(url);
    const cachedExecutor = executorFactory.getExecutor(url);

    expect(cachedExecutor).toBe(executor);
    expect(logger.debug).toHaveBeenCalledWith(
      `Returning cached executor for endpoint: ${url}`,
    );
  });

  it('should invalidate executor', () => {
    const url = 'http://example.com/graphql';
    executorFactory.getExecutor(url);
    executorFactory.invalidateExecutor(url);

    expect(executorFactory['executorCache'].has(url)).toBe(false);
    expect(logger.debug).toHaveBeenCalledWith(
      `Invalidating executor for endpoint: ${url}`,
    );
  });

  it('should add auth extensions if jwt is present', () => {
    const extensions = {};
    const context: { jwt?: { payload: DecodedIdToken } } = {
      jwt: { payload: { sub: 'user1', roles: ['admin'] } },
    } as { jwt?: { payload: DecodedIdToken } };
    const result = executorFactory['addAuthExtensions'](extensions, {
      context,
    });

    expect(result).toEqual({
      ...extensions,
      trusted: true,
      sub: 'user1',
      roles: ['admin'],
    });
  });

  it('should not add auth extensions if jwt is not present', () => {
    const extensions = {};
    const context = {};
    const result = executorFactory['addAuthExtensions'](extensions, context);

    expect(result).toEqual(extensions);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});
