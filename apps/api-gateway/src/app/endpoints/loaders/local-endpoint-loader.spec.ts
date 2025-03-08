import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import EndpointsConfigFactory from '../../config/factories/endpoints.config.factory';
import { ExecutorFactory } from '../../executors/executor-factory';
import { Endpoint } from '../models/endpoint.model';
import { LocalEndpointLoader } from './local-endpoint-loader';

jest.mock('exponential-backoff', () => ({
  backOff: jest.fn((fn) => fn()),
}));

describe('LocalEndpointLoader', () => {
  let module: TestingModule;
  let service: LocalEndpointLoader;
  let executorFactory: ExecutorFactory;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        LocalEndpointLoader,
        {
          provide: EndpointsConfigFactory.KEY,
          useValue: {
            endpoints: [
              {
                name: 'test',
                url: 'http://test.com',
              },
            ],
          },
        },
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        {
          provide: ExecutorFactory,
          useValue: {
            getExecutor: jest.fn(),
            invalidateExecutor: jest.fn(),
          },
        },
      ],
    }).compile();
    module.enableShutdownHooks();

    service = module.get<LocalEndpointLoader>(LocalEndpointLoader);
    executorFactory = module.get<ExecutorFactory>(ExecutorFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('removeEndpoint', () => {
    it('should remove endpoint and invalidate executor', async () => {
      const endpoint: Endpoint = {
        name: 'test',
        url: 'http://test.com',
      } as Endpoint;

      const result = await service.removeEndpoint({ name: 'test' });

      expect(result).toEqual(endpoint);
      expect(executorFactory.invalidateExecutor).toHaveBeenCalledWith(
        endpoint.url,
      );
    });

    it('should return undefined if endpoint is not removed', async () => {
      const result = await service.removeEndpoint({ name: 'test2' });

      expect(result).toBeUndefined();
    });
  });

  describe('loadEndpoint', () => {
    it('should load endpoint and return SDL', async () => {
      const endpoint: Endpoint = {
        name: 'test',
        url: 'http://test.com',
      } as Endpoint;
      const sdl = 'type Query { hello: String }';
      const fetcher = jest
        .fn()
        .mockResolvedValue({ data: { _service: { _sdl: sdl } } });
      (executorFactory.getExecutor as jest.Mock).mockReturnValue(fetcher);

      const result = await service.loadEndpoint(endpoint);

      expect(result).toEqual(sdl);
    });

    it('should throw if executor returns an async iterable', async () => {
      const endpoint: Endpoint = {
        name: 'test',
        url: 'http://test.com',
      } as Endpoint;
      const fetcher = jest.fn().mockResolvedValue(new ReadableStream());
      (executorFactory.getExecutor as jest.Mock).mockReturnValue(fetcher);

      await expect(service.loadEndpoint(endpoint)).rejects.toThrow(
        'Expected executor to return a single result',
      );
    });

    it('should throw if no SDL is found in response', async () => {
      const endpoint: Endpoint = {
        name: 'test',
        url: 'http://test.com',
      } as Endpoint;
      const fetcher = jest.fn().mockResolvedValue({ data: {} });
      (executorFactory.getExecutor as jest.Mock).mockReturnValue(fetcher);

      await expect(service.loadEndpoint(endpoint)).rejects.toThrow(
        'No SDL found in response',
      );
    });

    it('should throw if loading fails', async () => {
      const endpoint: Endpoint = {
        name: 'test',
        url: 'http://test.com',
      } as Endpoint;
      const fetcher = jest.fn().mockRejectedValue(new Error('Failed to fetch'));
      (executorFactory.getExecutor as jest.Mock).mockReturnValue(fetcher);

      await expect(service.loadEndpoint(endpoint)).rejects.toThrow(
        'Failed to fetch',
      );
    });
  });

  afterEach(async () => {
    await module.close();
  });
});
