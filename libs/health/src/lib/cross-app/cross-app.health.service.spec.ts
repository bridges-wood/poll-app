import { Test, TestingModule } from '@nestjs/testing';
import { RestCrossAppClient } from '@org/cross-app';
import { CrossAppHealthService } from './cross-app.health.service';

describe('CrossAppHealthService', () => {
  let service: CrossAppHealthService;
  let restClient: RestCrossAppClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrossAppHealthService,
        {
          provide: RestCrossAppClient,
          useValue: {
            url: 'http://example.com',
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CrossAppHealthService>(CrossAppHealthService);
    restClient = module.get<RestCrossAppClient>(RestCrossAppClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return true if response status is 200', async () => {
    jest
      .spyOn(restClient, 'query')
      .mockResolvedValue({ status: 200 } as Response);
    const result = await service.checkIn();
    expect(result).toBe(true);
  });

  it('should return false if response status is not 200', async () => {
    jest
      .spyOn(restClient, 'query')
      .mockResolvedValue({ status: 500 } as Response);
    const result = await service.checkIn();
    expect(result).toBe(false);
  });

  it('should log the correct message when checking in', async () => {
    const loggerSpy = jest.spyOn(service['logger'], 'debug');
    jest
      .spyOn(restClient, 'query')
      .mockResolvedValue({ status: 200 } as Response);
    await service.checkIn();
    expect(loggerSpy).toHaveBeenCalledWith(
      `Checking in with ${restClient.url}`,
    );
  });
});
