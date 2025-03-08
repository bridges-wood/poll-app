import { Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import HmacConfigFactory from '@org/config/hmac.config.factory';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { isAsyncIterable } from 'graphql-yoga';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ExecutorFactory } from '../../executors/executor-factory';
import { Endpoint } from '../models/endpoint.model';
import { EndpointLoader } from './index';

jest.mock('graphql-yoga', () => ({
  isAsyncIterable: jest.fn(),
}));

@Injectable()
class TestEndpointLoader extends EndpointLoader {
  public override endpoints$: BehaviorSubject<Endpoint[]>;
  protected async loadEndpoint(_endpoint: Endpoint): Promise<string> {
    return 'SDL';
  }
}

describe('EndpointLoader', () => {
  let module: TestingModule;
  let loader: TestEndpointLoader;
  let executorFactory: ExecutorFactory;

  beforeEach(async () => {
    (isAsyncIterable as unknown as jest.Mock).mockReturnValue(false);

    module = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(HmacConfigFactory)],
      providers: [
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        ExecutorFactory,
        {
          provide: EndpointLoader,
          useClass: TestEndpointLoader,
        },
      ],
    }).compile();
    module.enableShutdownHooks();

    loader = module.get<TestEndpointLoader>(EndpointLoader);
    executorFactory = module.get<ExecutorFactory>(ExecutorFactory);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
  });

  it('should reload endpoints after they are updated', async () => {
    const endpoint: Endpoint = {
      name: 'test',
      url: 'http://test.com',
    } as Endpoint;
    await loader.addEndpoint(endpoint);

    // Wait for the debounce time
    await new Promise((resolve) =>
      setTimeout(resolve, loader['DEBOUNCE_INTERVAL'] + 1),
    );

    expect(loader.getEndpoints()).toEqual([
      { ...endpoint, sdl: 'SDL', lastReload: expect.any(Date) },
    ]);
  });

  it('should add an endpoint', async () => {
    const endpoint: Endpoint = {
      name: 'test',
      url: 'http://test.com',
    } as Endpoint;
    await loader.addEndpoint(endpoint);

    expect(await firstValueFrom(loader.endpoints$)).toEqual([
      { ...endpoint },
    ] as Endpoint[]);
  });

  it('should remove an endpoint', async () => {
    const endpoint: Endpoint = {
      name: 'test',
      url: 'http://test.com',
    } as Endpoint;
    await loader.addEndpoint(endpoint);
    await loader.removeEndpoint({ name: 'test' });

    expect(await firstValueFrom(loader.endpoints$)).toEqual([]);
  });

  describe('unRegisterAllEndpoints', () => {
    it('should unregister all endpoints', async () => {
      const endpoint: Endpoint = {
        name: 'test',
        url: 'http://test.com',
      } as Endpoint;
      await loader.addEndpoint(endpoint);
      jest.spyOn(executorFactory, 'getExecutor').mockReturnValue(
        jest.fn().mockResolvedValue({
          data: {
            _reRegister: true,
          },
        }),
      );

      await loader.unRegisterAllEndpoints();

      expect(await firstValueFrom(loader.endpoints$)).toEqual([]);
    });

    it('should handle malformed responses', async () => {
      const endpoint: Endpoint = {
        name: 'test',
        url: 'http://test.com',
      } as Endpoint;
      await loader.addEndpoint(endpoint);
      jest
        .spyOn(executorFactory, 'getExecutor')
        .mockReturnValue(jest.fn().mockResolvedValue({}));

      expect(loader.unRegisterAllEndpoints()).resolves.not.toThrow();
    });

    it('should handle async iterable responses', async () => {
      (isAsyncIterable as unknown as jest.Mock).mockReturnValue(true);
      const endpoint: Endpoint = {
        name: 'test',
        url: 'http://test.com',
      } as Endpoint;
      await loader.addEndpoint(endpoint);
      jest
        .spyOn(executorFactory, 'getExecutor')
        .mockReturnValue(jest.fn().mockResolvedValue({}));

      expect(loader.unRegisterAllEndpoints()).resolves.not.toThrow();
    });

    it('should handle fetch errors', async () => {
      const endpoint: Endpoint = {
        name: 'test',
        url: 'http://test.com',
      } as Endpoint;
      await loader.addEndpoint(endpoint);
      jest
        .spyOn(executorFactory, 'getExecutor')
        .mockReturnValue(jest.fn().mockRejectedValue(new Error('test')));

      expect(loader.unRegisterAllEndpoints()).resolves.not.toThrow();
    });
  });

  it('should reload endpoints', async () => {
    const endpoint: Endpoint = {
      name: 'test',
      url: 'http://test.com',
    } as Endpoint;
    await loader.addEndpoint(endpoint);
    await loader.reload();

    expect(loader.getEndpoints()).toEqual([
      { ...endpoint, sdl: 'SDL', lastReload: expect.any(Date) },
    ]);
  });

  it('should handle reload with no endpoints', async () => {
    await loader.reload();

    expect(loader.getEndpoints()).toEqual([]);
  });

  it('should handle auto reload', async () => {
    const endpoint: Endpoint = {
      name: 'test',
      url: 'http://test.com',
    } as Endpoint;
    await loader.addEndpoint(endpoint);
    jest.spyOn(loader, 'reload').mockResolvedValue();
    await loader['autoReload']();

    expect(loader.reload).toHaveBeenCalled();
  });

  afterEach(async () => {
    await module.close();
  });
});
