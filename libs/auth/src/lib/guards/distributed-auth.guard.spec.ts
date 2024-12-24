import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_INSTANCE } from '@org/cache';
import { CrossAppAuthService } from '../cross-app/cross-app.auth.service';
import { DistributedStrategy } from '../strategies/distributed.strategy';
import { DistributedAuthGuard } from './distributed-auth.guard';

describe('DistributedAuthGuard', () => {
  let graphqlExecutionContext: GqlExecutionContext;
  let executionContext: ExecutionContext;
  let guard: DistributedAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    graphqlExecutionContext = {
      getContext: jest.fn(),
      getRoot: jest.fn(),
      getArgs: jest.fn(),
      getInfo: jest.fn(),
      switchToHttp: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as GqlExecutionContext;
    executionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getType: jest.fn().mockReturnValue('graphql'),
      getArgs: jest.fn().mockReturnValue([]),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getResponse: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ExecutionContext;

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule],
      providers: [
        DistributedAuthGuard,
        {
          provide: CrossAppAuthService,
          useValue: {
            validateToken: jest.fn(),
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
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        DistributedStrategy,
      ],
      
    }).compile();

    guard = module.get<DistributedAuthGuard>(DistributedAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if the route is public', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(graphqlExecutionContext);
      jest
        .spyOn(graphqlExecutionContext, 'getContext')
        .mockReturnValue({ req: {} });

      expect(guard.canActivate(executionContext)).toBe(true);
    });

    it('should call super.canActivate if the route is not public', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(graphqlExecutionContext);
      jest.spyOn(graphqlExecutionContext, 'getContext').mockReturnValue({
        req: {
          body: {
            extensions: {
              trusted: true,
              sub: '1',
              roles: ['user'],
            },
          },
        },
      });
      const superCanActivate = jest.spyOn(
        AuthGuard('distributed').prototype,
        'canActivate',
      );

      expect(guard.canActivate(executionContext)).toBeTruthy();
      expect(superCanActivate).toHaveBeenCalledWith(executionContext);
    });
  });

  describe('getRequest', () => {
    it('should return the request object from the GraphQL context', () => {
      const req = {};
      graphqlExecutionContext.getContext = jest.fn().mockReturnValue({ req });
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(graphqlExecutionContext);

      expect(guard.getRequest(executionContext)).toBe(req);
    });
  });
});
