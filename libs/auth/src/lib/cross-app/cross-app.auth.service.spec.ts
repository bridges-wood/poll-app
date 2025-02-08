import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_INSTANCE } from '@org/cache';
import { GraphQLCrossAppClient } from '@org/cross-app';
import { ValidateTokenDocument } from '@org/graphql';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { Cacheable } from 'cacheable';
import { CrossAppAuthService } from './cross-app.auth.service';

describe('CrossAppAuthService', () => {
  let service: CrossAppAuthService;
  let client: GraphQLCrossAppClient;
  let jwtService: JwtService;
  let cache: Cacheable;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrossAppAuthService,
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        {
          provide: GraphQLCrossAppClient,
          useValue: {
            impersonating: jest.fn().mockReturnThis(),
            query: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            decode: jest.fn(),
          },
        },
        {
          provide: CACHE_INSTANCE,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CrossAppAuthService>(CrossAppAuthService);
    client = module.get<GraphQLCrossAppClient>(GraphQLCrossAppClient);
    jwtService = module.get<JwtService>(JwtService);
    cache = module.get<Cacheable>(CACHE_INSTANCE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error if token is missing', async () => {
    await expect(service.validateToken(undefined)).rejects.toThrow(
      'Token is missing',
    );
  });

  it('should return cached value if token is found in cache', async () => {
    const token = 'test-token';
    const cachedValue = { id: 'user-id', roles: ['user'] };
    jest.spyOn(cache, 'get').mockResolvedValueOnce(cachedValue);

    const result = await service.validateToken(token);

    expect(result).toEqual(cachedValue);
    expect(cache.get).toHaveBeenCalledWith(token);
  });

  it('should throw an error if token is invalid', async () => {
    const token = 'invalid-token';
    const queryResult = { validateToken: null };
    jest.spyOn(cache, 'get').mockResolvedValueOnce(null);
    jest.spyOn(client, 'query').mockResolvedValueOnce(queryResult);
    jest.spyOn(jwtService, 'decode').mockReturnValueOnce(null);

    await expect(service.validateToken(token)).rejects.toThrow();
  });

  it('should query the client if token is not found in cache', async () => {
    const token = 'test-token';
    const queryResult = { validateToken: { id: 'user-id', roles: ['user'] } };
    jest.spyOn(cache, 'get').mockResolvedValueOnce(null);
    jest.spyOn(client, 'query').mockResolvedValueOnce(queryResult);
    jest
      .spyOn(jwtService, 'decode')
      .mockReturnValueOnce({ exp: Math.floor(Date.now() / 1000) + 3600 });

    const result = await service.validateToken(token);

    expect(result).toEqual(queryResult.validateToken);
    expect(client.query).toHaveBeenCalledWith(ValidateTokenDocument, { token });
    expect(cache.set).toHaveBeenCalledWith(
      token,
      queryResult.validateToken,
      expect.any(Number),
    );
  });

  it('should throw an error if token cannot be decoded', () => {
    const token = 'invalid-token';
    jest.spyOn(jwtService, 'decode').mockReturnValueOnce(null);

    expect(() => service['getTtl'](token)).toThrow();
  });

  it('should return the correct TTL for a valid token', () => {
    const token = 'valid-token';
    const decodedToken = { exp: Math.floor(Date.now() / 1000) + 3600 }; // 1 hour from now
    jest.spyOn(jwtService, 'decode').mockReturnValueOnce(decodedToken);

    const ttl = service['getTtl'](token);

    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(3600000); // 1 hour in milliseconds
  });
});
