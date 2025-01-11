import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { resolveSrv } from 'dns/promises';
import { ExecutorFactory } from '../../executors/executor-factory';
import { Endpoint } from '../models/endpoint.model';
import { DnsEndpointLoader } from './dns-endpoint-loader';

jest.mock('dns/promises', () => ({
  resolveSrv: jest.fn(),
}));

describe('DnsEndpointLoader', () => {
  let service: DnsEndpointLoader;
  let executorFactory: ExecutorFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DnsEndpointLoader,
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

    service = module.get<DnsEndpointLoader>(DnsEndpointLoader);
    executorFactory = module.get<ExecutorFactory>(ExecutorFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loadEndpoint', () => {
    it('should load endpoint successfully', async () => {
      const endpoint: Endpoint = { name: 'test-service' } as Endpoint;
      const mockSDL = 'type Query { _sdl: String }';
      const mockResult = { data: { _service: { _sdl: mockSDL } } };

      (resolveSrv as jest.Mock).mockResolvedValue([
        { name: 'test-service-host', port: 1234 },
      ]);
      const fetcher = jest.fn().mockResolvedValue(mockResult);
      (executorFactory.getExecutor as jest.Mock).mockReturnValue(fetcher);

      const result = await service.loadEndpoint(endpoint);

      expect(result).toBe(mockSDL);
      expect(resolveSrv).toHaveBeenCalledWith('test-service.service.consul');
    });

    it('should throw an error if no SDL is returned', async () => {
      const endpoint: Endpoint = { name: 'test-service' } as Endpoint;
      const mockResult = { data: {} };

      (resolveSrv as jest.Mock).mockResolvedValue([
        { name: 'test-service-host', port: 1234 },
      ]);
      const fetcher = jest.fn().mockResolvedValue(mockResult);
      (executorFactory.getExecutor as jest.Mock).mockReturnValue(fetcher);

      await expect(service.loadEndpoint(endpoint)).rejects.toThrow(
        'No SDL found in response',
      );
    });

    it('should throw an error if no SRV records are found', async () => {
      const endpoint: Endpoint = { name: 'test-service' } as Endpoint;

      (resolveSrv as jest.Mock).mockResolvedValue([]);

      await expect(service.loadEndpoint(endpoint)).rejects.toThrow(
        `No SRV records found for ${endpoint.name}`,
      );
    });

    it('should throw if loading fails', async () => {
      const endpoint: Endpoint = { name: 'test-service' } as Endpoint;

      (resolveSrv as jest.Mock).mockRejectedValue(
        new Error('Failed to resolve SRV records'),
      );

      await expect(service.loadEndpoint(endpoint)).rejects.toThrow(
        'Failed to resolve SRV records',
      );
    });
  });

  describe('resolveService', () => {
    it('should resolve service successfully', async () => {
      const serviceName = 'test-service';
      const mockService = 'test-service-host:1234';

      (resolveSrv as jest.Mock).mockResolvedValue([
        { name: 'test-service-host', port: 1234 },
      ]);

      const result = await service['resolveService'](serviceName);

      expect(result).toBe(mockService);
      expect(resolveSrv).toHaveBeenCalledWith(`${serviceName}.service.consul`);
    });

    it('should throw an error if no SRV records are found', async () => {
      const serviceName = 'test-service';

      (resolveSrv as jest.Mock).mockResolvedValue([]);

      await expect(service['resolveService'](serviceName)).rejects.toThrow(
        `No SRV records found for ${serviceName}`,
      );
    });
  });
});
