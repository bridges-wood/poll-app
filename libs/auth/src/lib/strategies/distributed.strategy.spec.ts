import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_INSTANCE } from '@org/cache';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { Cacheable } from 'cacheable';
import { FastifyRequest as Request } from 'fastify';
import { AuthConfigModule } from '../config/auth.config.module';
import { CrossAppAuthService } from '../cross-app/cross-app.auth.service';
import { extractAuthTokenFromHeader } from '../utils';
import { DistributedStrategy } from './distributed.strategy';

jest.mock('../utils', () => ({ extractAuthTokenFromHeader: jest.fn() }));

describe('DistributedStrategy', () => {
  let strategy: DistributedStrategy;
  let crossAppAuthService: CrossAppAuthService;
  let jwtService: JwtService;
  let cache: Cacheable;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthConfigModule],
      providers: [
        DistributedStrategy,
        { provide: BaseLogger, useClass: TestLogger },
        {
          provide: CrossAppAuthService,
          useValue: { validateToken: jest.fn() },
        },
        { provide: JwtService, useValue: { decode: jest.fn() } },
        {
          provide: CACHE_INSTANCE,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
      ],
    }).compile();

    strategy = module.get<DistributedStrategy>(DistributedStrategy);
    crossAppAuthService = module.get<CrossAppAuthService>(CrossAppAuthService);
    jwtService = module.get<JwtService>(JwtService);
    cache = module.get<Cacheable>(CACHE_INSTANCE);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return user data if request is trusted', async () => {
    const req = {
      body: { extensions: { trusted: true, sub: '123', roles: ['admin'] } },
    } as Request;
    const result = await strategy.validate(req);
    expect(result).toEqual({ id: '123', roles: ['admin'] });
  });

  it('should throw an error if token is missing', async () => {
    (extractAuthTokenFromHeader as jest.Mock).mockReturnValue(null);
    const req = { body: {} } as Request;
    await expect(strategy.validate(req)).rejects.toThrow('Token is missing');
  });

  it('should return cached user data if token is found in cache', async () => {
    const token = 'token';
    const cachedUser = { id: '123', roles: ['admin'] };
    (extractAuthTokenFromHeader as jest.Mock).mockReturnValue(token);
    (cache.get as jest.Mock).mockResolvedValue(cachedUser);

    const req = { body: {} } as Request;
    const result = await strategy.validate(req);
    expect(result).toEqual(cachedUser);
    expect(cache.get).toHaveBeenCalledWith(token);
  });

  it('should validate token and cache user data if token is not found in cache', async () => {
    const token = 'token';
    const user = { id: '123', roles: ['admin'] };
    (extractAuthTokenFromHeader as jest.Mock).mockReturnValue(token);
    (cache.get as jest.Mock).mockResolvedValue(null);
    (crossAppAuthService.validateToken as jest.Mock).mockResolvedValue(user);
    (jwtService.decode as jest.Mock).mockReturnValue({
      exp: Date.now() / 1000 + 60,
    });

    const req = { body: {} } as Request;
    const result = await strategy.validate(req);
    expect(result).toEqual(user);
    expect(cache.get).toHaveBeenCalledWith(token);
    expect(crossAppAuthService.validateToken).toHaveBeenCalledWith(token);
    expect(cache.set).toHaveBeenCalledWith(token, user, expect.any(Number));
  });

  it('should throw an error if token cannot be decoded', async () => {
    const token = 'token';
    (extractAuthTokenFromHeader as jest.Mock).mockReturnValue(token);
    (cache.get as jest.Mock).mockResolvedValue(null);
    (crossAppAuthService.validateToken as jest.Mock).mockResolvedValue({
      id: '123',
      roles: ['admin'],
    });
    (jwtService.decode as jest.Mock).mockReturnValue(undefined);
    const req = { body: {} } as Request;
    await expect(strategy.validate(req)).rejects.toThrow(
      'Token does not have an expiry date',
    );
  });

  it('should bypass authentication in development mode', async () => {
    jest.spyOn(strategy['environmentConfig'], 'isDev').mockReturnValue(true);
    // Mock the bypassAuth property as a getter
    Object.defineProperty(strategy['authConfig'], 'bypassAuth', {
      get: () => true,
    });

    const req = { body: {} } as Request;
    const result = await strategy.validate(req);
    expect(result).toEqual({
      id: '00000000-0000-0000-0000-000000000000',
      roles: ['admin'],
    });
  });
});
