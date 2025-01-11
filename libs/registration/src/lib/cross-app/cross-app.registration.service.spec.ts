import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLCrossAppClient } from '@org/cross-app';
import {
  DeRegisterServiceDocument,
  RegisterServiceDocument,
} from '@org/graphql';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { exec } from 'child_process';
import { CrossAppRegistrationService } from './cross-app.registration.service';

jest.mock('@org/cross-app');
jest.mock('@org/graphql');
jest.mock('child_process', () => ({
  exec: jest.fn().mockImplementation((cmd, callback) => {
    callback(null, { stdout: 'mocked-hash', stderr: '' });
  }),
}));

describe('CrossAppRegistrationService', () => {
  let service: CrossAppRegistrationService;
  let client: GraphQLCrossAppClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        CrossAppRegistrationService,
        {
          provide: GraphQLCrossAppClient,
          useFactory: (logger: BaseLogger) =>
            new GraphQLCrossAppClient('http://example.com', logger),
          inject: [BaseLogger],
        },
      ],
    }).compile();

    service = module.get<CrossAppRegistrationService>(
      CrossAppRegistrationService,
    );
    client = module.get<GraphQLCrossAppClient>(GraphQLCrossAppClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a service', async () => {
      const mockResponse = { addEndpoint: { id: '1' } };
      (client.mutate as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.register('test-service', 3000, true);

      expect(result).toEqual(mockResponse.addEndpoint);
      expect(client.mutate).toHaveBeenCalledWith(RegisterServiceDocument, {
        args: {
          name: 'test-service',
          hash: 'mocked-hash',
          url: 'https://localhost:3000/graphql',
          jwksUri: 'https://localhost:3000/.well-known/jwks.json',
        },
      });
    });

    it('should retry on failure', async () => {
      const mockResponse = { addEndpoint: { id: '1' } };
      (client.mutate as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue(mockResponse);

      const result = await service.register('test-service', 3000, true);

      expect(result).toEqual(mockResponse.addEndpoint);
      expect(client.mutate).toHaveBeenCalledTimes(2);
    });

    it('should work with default hasJwks', async () => {
      const mockResponse = { addEndpoint: { id: '1' } };
      (client.mutate as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.register('test-service', 3000);

      expect(result).toEqual(mockResponse.addEndpoint);
      expect(client.mutate).toHaveBeenCalledWith(RegisterServiceDocument, {
        args: {
          name: 'test-service',
          hash: 'mocked-hash',
          url: 'https://localhost:3000/graphql',
          jwksUri: undefined,
        },
      });
    });
  });

  describe('unregister', () => {
    it('should unregister a service', async () => {
      const mockResponse = { removeEndpoint: { success: true } };
      (client.mutate as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.unregister('test-service');

      expect(result).toBe(true);
      expect(client.mutate).toHaveBeenCalledWith(DeRegisterServiceDocument, {
        name: 'test-service',
      });
    });
  });

  describe('getHash', () => {
    it('should return the latest commit hash', async () => {
      const hash = await service['getHash']();
      expect(hash).toBe('mocked-hash');
    });

    it('should throw an error if no hash is found', async () => {
      (exec as unknown as jest.Mock).mockImplementation((cmd, callback) => {
        callback(null, { stdout: '', stderr: 'error' });
      });

      await expect(service['getHash']()).rejects.toThrow('error');
    });
  });
});
