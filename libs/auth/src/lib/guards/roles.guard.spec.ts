import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { User } from '@org/typings';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        Reflector,
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  it('should return true if no roles are required', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    const context = createMockExecutionContext();
    const result = await rolesGuard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return true if user has required roles', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    const context = createMockExecutionContext({ roles: ['admin'] });
    const result = await rolesGuard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return false if user does not have required roles', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    const context = createMockExecutionContext({ roles: ['user'] });
    const result = await rolesGuard.canActivate(context);
    expect(result).toBe(false);
  });

  function createMockExecutionContext(
    user: Partial<User> = {},
  ): ExecutionContext {
    const context = {
      switchToHttp: jest.fn().mockReturnThis(),
      getType: jest.fn().mockReturnValue('graphql'),
      getArgs: jest.fn().mockReturnValue([]),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getRequest: jest.fn().mockReturnValue({ user }),
    } as unknown as ExecutionContext;

    const gqlContext = GqlExecutionContext.create(context);
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(gqlContext);
    jest.spyOn(gqlContext, 'getContext').mockReturnValue({ req: { user } });

    return context;
  }
});
