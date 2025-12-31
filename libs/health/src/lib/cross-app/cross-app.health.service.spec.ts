import { Test, TestingModule } from '@nestjs/testing';
import EnvironmentConfigFactory from '@org/config/environment.config.factory';
import { GraphQLCrossAppClient, RestCrossAppClient } from '@org/cross-app';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { CrossAppHealthService } from './cross-app.health.service';

describe('CrossAppHealthService', () => {
  let service: CrossAppHealthService;
  let restClient: RestCrossAppClient;
  let graphqlClient: GraphQLCrossAppClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EnvironmentConfigFactory.KEY,
          useValue: {
            name: 'test-service',
          },
        },
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        CrossAppHealthService,
        {
          provide: RestCrossAppClient,
          useValue: {
            url: 'http://example.com',
            query: jest.fn(),
          },
        },
        {
          provide: GraphQLCrossAppClient,
          useValue: {
            url: 'http://example.com',
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CrossAppHealthService>(CrossAppHealthService);
    restClient = module.get<RestCrossAppClient>(RestCrossAppClient);
    graphqlClient = module.get<GraphQLCrossAppClient>(GraphQLCrossAppClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return true if response status is 200 and the endpoint is registered', async () => {
    jest
      .spyOn(restClient, 'query')
      .mockResolvedValue({ status: 200 } as Response);
    jest.spyOn(graphqlClient, 'query').mockResolvedValue({
      endpoints: ['http://example.com/health'],
    });

    const result = await service.checkIn();
    expect(result).toBe(true);
  });

  it('should return false if response status is not 200', async () => {
    jest
      .spyOn(restClient, 'query')
      .mockResolvedValue({ status: 500 } as Response);

    expect(async () => await service.checkIn()).rejects.toThrow(
      'Cross-app health check failed with status 500',
    );
  });

  it('should return false if no registration is found', async () => {
    jest
      .spyOn(restClient, 'query')
      .mockResolvedValue({ status: 200 } as Response);
    jest.spyOn(graphqlClient, 'query').mockResolvedValue({
      endpoints: [],
    });

    expect(async () => await service.checkIn()).rejects.toThrow(
      'No registration found',
    );
  });
});
