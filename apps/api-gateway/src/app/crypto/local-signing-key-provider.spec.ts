import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { JwksClient } from 'jwks-rsa';
import { EndpointsService } from '../endpoints/endpoints.service';
import { LoadedEndpoint } from '../endpoints/models/loaded-endpoint.model';
import { LocalSigningKeyProvider } from './local-signing-key-provider';

jest.mock('jwks-rsa');

describe('LocalSigningKeyProvider', () => {
  let provider: LocalSigningKeyProvider;
  let endpointsService: EndpointsService;
  let logger: TestLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalSigningKeyProvider,
        {
          provide: EndpointsService,
          useValue: {
            getEndpoints: jest.fn(),
          },
        },
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
      ],
    }).compile();

    provider = module.get<LocalSigningKeyProvider>(LocalSigningKeyProvider);
    endpointsService = module.get<EndpointsService>(EndpointsService);
    logger = module.get<TestLogger>(BaseLogger);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('build', () => {
    it('should build JwksClients and return a signing key', async () => {
      const mockEndpoints: LoadedEndpoint[] = [
        { jwksUri: 'https://example.com/.well-known/jwks.json' },
      ] as LoadedEndpoint[];
      const mockKey = { getPublicKey: jest.fn().mockReturnValue('publicKey') };
      (endpointsService.getEndpoints as jest.Mock).mockReturnValue(
        mockEndpoints,
      );
      (JwksClient as jest.Mock).mockImplementation(() => ({
        getSigningKey: jest.fn().mockResolvedValue(mockKey),
      }));

      const getSigningKey = provider.build();
      const result = await getSigningKey('kid');

      expect(endpointsService.getEndpoints).toHaveBeenCalled();
      expect(JwksClient).toHaveBeenCalledWith(mockEndpoints[0]);
      expect(result).toBe('publicKey');
    });

    it('should log the number of built JwksClients', async () => {
      const mockEndpoints: LoadedEndpoint[] = [
        { jwksUri: 'https://example.com/.well-known/jwks.json' },
      ] as LoadedEndpoint[];
      const mockKey = { getPublicKey: jest.fn().mockReturnValue('publicKey') };
      (endpointsService.getEndpoints as jest.Mock).mockReturnValue(
        mockEndpoints,
      );
      (JwksClient as jest.Mock).mockImplementation(() => ({
        getSigningKey: jest.fn().mockResolvedValue(mockKey),
      }));

      const getSigningKey = provider.build();
      await getSigningKey('kid');

      expect(logger.debug).toHaveBeenCalledWith('Built 1 JwksClients');
    });

    it('should throw if no endpoints are available', async () => {
      (endpointsService.getEndpoints as jest.Mock).mockReturnValue([]);

      const getSigningKey = provider.build();
      await expect(getSigningKey('kid')).rejects.toThrow();
    });
  });

  describe('isJwksEndpoint', () => {
    it('should return true if endpoint has jwksUri', () => {
      const endpoint = {
        jwksUri: 'https://example.com/.well-known/jwks.json',
      } as LoadedEndpoint;
      expect(provider['isJwksEndpoint'](endpoint)).toBe(true);
    });

    it('should return false if endpoint does not have jwksUri', () => {
      const endpoint = {} as LoadedEndpoint;
      expect(provider['isJwksEndpoint'](endpoint)).toBe(false);
    });
  });
});
