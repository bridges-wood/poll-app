import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_INSTANCE } from '@org/cache';
import { GraphQLCrossAppClient } from '@org/cross-app';
import {
  FindEndpointsWithJwksDocument,
  FindEndpointsWithJwksQuery,
} from '@org/graphql';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { Cacheable } from 'cacheable';
import { JwksClient } from 'jwks-rsa';
import { StoredDataRaw } from 'keyv';
import { JWKS_URI_CACHE_KEY } from './constants';
import { RemoteSigningKeyProvider } from './remote.signing-key.provider';

jest.mock('jwks-rsa', () => ({ JwksClient: jest.fn() }));

describe('RemoteSigningKeyProvider', () => {
  let provider: RemoteSigningKeyProvider;
  let client: GraphQLCrossAppClient;
  let cache: Cacheable;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoteSigningKeyProvider,
        { provide: BaseLogger, useClass: TestLogger },
        { provide: GraphQLCrossAppClient, useValue: { query: jest.fn() } },
        {
          provide: CACHE_INSTANCE,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
      ],
    }).compile();

    provider = module.get<RemoteSigningKeyProvider>(RemoteSigningKeyProvider);
    client = module.get<GraphQLCrossAppClient>(GraphQLCrossAppClient);
    cache = module.get<Cacheable>(CACHE_INSTANCE);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('build', () => {
    it('should build signing key function', async () => {
      const jwksUris = ['https://example.com/.well-known/jwks.json'];
      jest.spyOn(provider, 'findJwksUris').mockResolvedValue(jwksUris);
      const jwksClient: JwksClient = {
        getSigningKey: jest
          .fn()
          .mockResolvedValue({ getPublicKey: () => 'publicKey' }),
        getKeys: jest.fn(),
        getSigningKeys: jest.fn(),
      };
      (JwksClient as jest.Mock).mockImplementation(() => jwksClient);

      const getSigningKey = provider.build();
      const publicKey = await getSigningKey('kid');

      expect(publicKey).toBe('publicKey');
    });

    it('should reject if no jwks URIs found', async () => {
      jest
        .spyOn(client, 'query')
        .mockResolvedValue({ endpoints: [] } as FindEndpointsWithJwksQuery);

      const getSigningKey = provider.build();

      await expect(getSigningKey('kid')).rejects.toThrow(
        'No endpoints with JWKS URIs found',
      );
    });

    it('should reject if no signing key found', async () => {
      const jwksUris = ['https://example.com/.well-known/jwks.json'];
      jest.spyOn(provider, 'findJwksUris').mockResolvedValue(jwksUris);
      const jwksClient: JwksClient = {
        getSigningKey: jest.fn().mockRejectedValue(new Error('Not found')),
        getKeys: jest.fn(),
        getSigningKeys: jest.fn(),
      };
      (JwksClient as jest.Mock).mockImplementation(() => jwksClient);

      const getSigningKey = provider.build();

      await expect(getSigningKey('kid')).rejects.toThrow(
        'Signing key not found for kid: kid',
      );
    });
  });

  describe('findJwksUris', () => {
    it('should return cached jwks URIs if available', async () => {
      const cachedUris = ['https://example.com/.well-known/jwks.json'];
      jest
        .spyOn(cache, 'get')
        .mockResolvedValue(cachedUris as StoredDataRaw<string[]>);

      const result = await provider.findJwksUris();

      expect(result).toBe(cachedUris);
      expect(cache.get).toHaveBeenCalledWith(JWKS_URI_CACHE_KEY);
    });

    it('should query and cache jwks URIs if not in cache', async () => {
      const endpointsWithJwks = [
        { jwksUri: 'https://example.com/.well-known/jwks.json' },
      ];
      const queryResult = {
        endpoints: endpointsWithJwks,
      } as FindEndpointsWithJwksQuery;
      jest.spyOn(cache, 'get').mockResolvedValue(undefined);
      jest.spyOn(client, 'query').mockResolvedValue(queryResult);
      jest.spyOn(cache, 'set').mockResolvedValue(true);

      const result = await provider.findJwksUris();

      expect(result).toEqual(endpointsWithJwks.map((e) => e.jwksUri));
      expect(client.query).toHaveBeenCalledWith(
        FindEndpointsWithJwksDocument,
        {},
      );
      expect(cache.set).toHaveBeenCalledWith(
        JWKS_URI_CACHE_KEY,
        endpointsWithJwks.map((e) => e.jwksUri),
        '1d',
      );
    });

    it('should throw an error if no endpoints with jwks URIs found', async () => {
      const queryResult = { endpoints: [] } as FindEndpointsWithJwksQuery;
      jest.spyOn(cache, 'get').mockResolvedValue(undefined);
      jest.spyOn(client, 'query').mockResolvedValue(queryResult);

      await expect(provider.findJwksUris()).rejects.toThrow(
        'No endpoints with JWKS URIs found',
      );
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});
