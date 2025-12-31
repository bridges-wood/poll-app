import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { EndpointsService } from './endpoints.service';
import { EndpointLoader } from './loaders';
import { AddEndpointArgs } from './models/add-endpoint.args';
import { AddEndpointResult } from './models/add-endpoint.result';
import { EndpointFilter } from './models/endpoint-filter.args';
import { LoadedEndpoint } from './models/loaded-endpoint.model';
import { ReloadAllEndpointsResult } from './models/reload-all-endpoints.result';
import { RemoveEndpointResult } from './models/remove-endpoint.result';

describe('EndpointsService', () => {
  let service: EndpointsService;
  let endpointLoader: EndpointLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EndpointsService,
        {
          provide: EndpointLoader,
          useValue: {
            getEndpoints: jest.fn(),
            addEndpoint: jest.fn(),
            removeEndpoint: jest.fn(),
            reload: jest.fn(),
            unRegisterAllEndpoints: jest.fn(),
          },
        },
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
      ],
    }).compile();

    service = module.get<EndpointsService>(EndpointsService);
    endpointLoader = module.get<EndpointLoader>(EndpointLoader);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEndpoints', () => {
    it('should return all endpoints when no filter is provided', () => {
      const endpoints: LoadedEndpoint[] = [
        { name: 'test' },
      ] as LoadedEndpoint[];
      jest.spyOn(endpointLoader, 'getEndpoints').mockReturnValue(endpoints);

      expect(service.getEndpoints()).toEqual(endpoints);
    });

    it('should return filtered endpoints when filter is provided', () => {
      const endpoints: LoadedEndpoint[] = [
        { name: 'test' },
      ] as LoadedEndpoint[];
      const filter: EndpointFilter = {
        name: {
          eq: 'test',
        },
      };
      jest.spyOn(endpointLoader, 'getEndpoints').mockReturnValue(endpoints);
      jest.spyOn(service, 'search').mockReturnValue(endpoints);

      expect(service.getEndpoints(filter)).toEqual(endpoints);
    });
  });

  describe('addEndpoint', () => {
    it('should add a new endpoint', async () => {
      const endpoint: LoadedEndpoint = { name: 'test' } as LoadedEndpoint;
      const args: AddEndpointArgs = { name: 'test' } as AddEndpointArgs;
      const result: AddEndpointResult = {
        endpoint,
        success: true,
      };
      jest.spyOn(endpointLoader, 'getEndpoints').mockReturnValue([]);
      jest.spyOn(endpointLoader, 'addEndpoint').mockResolvedValue(endpoint);

      expect(await service.addEndpoint(args)).toEqual(result);
    });

    it('should overwrite an existing endpoint', async () => {
      const endpoint: LoadedEndpoint = { name: 'test' } as LoadedEndpoint;
      const args: AddEndpointArgs = { name: 'test' } as AddEndpointArgs;
      const result: AddEndpointResult = {
        endpoint,
        success: true,
      };
      jest
        .spyOn(endpointLoader, 'getEndpoints')
        .mockReturnValue([{ name: 'test' }] as LoadedEndpoint[]);
      jest.spyOn(endpointLoader, 'removeEndpoint').mockResolvedValue(undefined);
      jest.spyOn(endpointLoader, 'addEndpoint').mockResolvedValue(endpoint);

      expect(await service.addEndpoint(args)).toEqual(result);
    });
  });

  describe('removeEndpoint', () => {
    it('should remove an endpoint', async () => {
      const name = 'test';
      const result: RemoveEndpointResult = { success: true };
      jest.spyOn(endpointLoader, 'removeEndpoint').mockResolvedValue(undefined);

      expect(await service.removeEndpoint(name)).toEqual(result);
    });

    it('should handle errors when removing an endpoint', async () => {
      const name = 'test';
      jest
        .spyOn(endpointLoader, 'removeEndpoint')
        .mockRejectedValue(new Error('error'));

      expect(() => service.removeEndpoint(name)).rejects.toThrow(new Error('error'));
    });
  });

  describe('reloadAllEndpoints', () => {
    it('should reload all endpoints', async () => {
      const endpoints: LoadedEndpoint[] = [
        { name: 'test' },
      ] as LoadedEndpoint[];
      const result: ReloadAllEndpointsResult = {
        success: true,
        loadedEndpoints: endpoints,
      };
      jest.spyOn(endpointLoader, 'reload').mockResolvedValue(undefined);
      jest.spyOn(endpointLoader, 'getEndpoints').mockReturnValue(endpoints);

      expect(await service.reloadAllEndpoints()).toEqual(result);
    });

    it('should handle errors when reloading all endpoints', async () => {
      const endpoints: LoadedEndpoint[] = [
        { name: 'test' },
      ] as LoadedEndpoint[];
      const result: ReloadAllEndpointsResult = {
        success: false,
        loadedEndpoints: endpoints,
      };
      jest
        .spyOn(endpointLoader, 'reload')
        .mockRejectedValue(new Error('error'));
      jest.spyOn(endpointLoader, 'getEndpoints').mockReturnValue(endpoints);

      expect(await service.reloadAllEndpoints()).toEqual(result);
    });
  });

  describe('onApplicationShutdown', () => {
    it('should unregister all endpoints on application shutdown', async () => {
      jest
        .spyOn(endpointLoader, 'unRegisterAllEndpoints')
        .mockResolvedValue(undefined);

      await service.onApplicationShutdown();

      expect(endpointLoader.unRegisterAllEndpoints).toHaveBeenCalled();
    });
  });
});
