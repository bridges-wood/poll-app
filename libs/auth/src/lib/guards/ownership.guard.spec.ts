import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { User } from '@org/typings';
import { ResourceOwnershipMetadata } from '../decorators/resource-owner.decorator';
import { OwnershipGuard } from './ownership.guard';
import { OwnedResource } from './resource-ownership.interface';
import { ResourceOwnershipRegistry } from './resource-ownership.registry';
import { ResourceType } from './resource-type.enum';

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;
  let reflector: Reflector;
  let registry: ResourceOwnershipRegistry;
  let logger: BaseLogger;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    roles: [],
    posts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOwnedResource: OwnedResource = {
    id: 'post-123',
    author: {
      id: 'user-123',
    },
  };

  const mockNotOwnedResource: OwnedResource = {
    id: 'post-456',
    author: {
      id: 'other-user-456',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnershipGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ResourceOwnershipRegistry,
          useValue: {
            getResource: jest.fn(),
          },
        },
        {
          provide: BaseLogger,
          useValue: {
            setContext: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<OwnershipGuard>(OwnershipGuard);
    reflector = module.get<Reflector>(Reflector);
    registry = module.get<ResourceOwnershipRegistry>(ResourceOwnershipRegistry);
    logger = module.get<BaseLogger>(BaseLogger);
  });

  const createMockExecutionContext = (
    user: User | null,
    args: Record<string, unknown>,
  ): ExecutionContext => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToHttp: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;

    // Mock GqlExecutionContext
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: jest.fn().mockReturnValue({
        req: { user },
      }),
      getArgs: jest.fn().mockReturnValue(args),
    } as any);

    return mockContext;
  };

  describe('canActivate', () => {
    it('should return true when no metadata is present', async () => {
      const context = createMockExecutionContext(mockUser, {});
      jest.spyOn(reflector, 'get').mockReturnValue(undefined);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when user owns the resource', async () => {
      const metadata: ResourceOwnershipMetadata = {
        resourceType: ResourceType.POST,
        idParamName: 'id',
      };
      const context = createMockExecutionContext(mockUser, { id: 'post-123' });

      jest.spyOn(reflector, 'get').mockReturnValue(metadata);
      jest.spyOn(registry, 'getResource').mockResolvedValue(mockOwnedResource);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(registry.getResource).toHaveBeenCalledWith(
        ResourceType.POST,
        'post-123',
      );
      expect(logger.debug).toHaveBeenCalledWith(
        'User user-123 authorized for post post-123',
      );
    });

    it('should throw ForbiddenException when user does not own the resource', async () => {
      const metadata: ResourceOwnershipMetadata = {
        resourceType: ResourceType.POST,
        idParamName: 'id',
      };
      const context = createMockExecutionContext(mockUser, { id: 'post-456' });

      jest.spyOn(reflector, 'get').mockReturnValue(metadata);
      jest
        .spyOn(registry, 'getResource')
        .mockResolvedValue(mockNotOwnedResource);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'You do not have permission to access this resource',
      );

      expect(logger.warn).toHaveBeenCalledWith(
        'User user-123 attempted to access post post-456 owned by other-user-456',
      );
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      const metadata: ResourceOwnershipMetadata = {
        resourceType: ResourceType.POST,
        idParamName: 'id',
      };
      const context = createMockExecutionContext(null, { id: 'post-123' });

      jest.spyOn(reflector, 'get').mockReturnValue(metadata);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'You must be authenticated to access this resource',
      );

      expect(logger.warn).toHaveBeenCalledWith(
        'Ownership check failed: no authenticated user for post',
      );
    });

    it('should throw ForbiddenException when resource ID is not provided', async () => {
      const metadata: ResourceOwnershipMetadata = {
        resourceType: ResourceType.POST,
        idParamName: 'id',
      };
      const context = createMockExecutionContext(mockUser, {});

      jest.spyOn(reflector, 'get').mockReturnValue(metadata);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Resource ID not provided',
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Ownership check failed: no id parameter found in args',
      );
    });

    it('should throw ForbiddenException when resource is not found', async () => {
      const metadata: ResourceOwnershipMetadata = {
        resourceType: ResourceType.POST,
        idParamName: 'id',
      };
      const context = createMockExecutionContext(mockUser, {
        id: 'non-existent',
      });

      jest.spyOn(reflector, 'get').mockReturnValue(metadata);
      jest
        .spyOn(registry, 'getResource')
        .mockRejectedValue(new Error('Not found'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Unable to verify resource ownership',
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Error checking ownership for post non-existent: Not found',
      );
    });

    it('should use custom ID parameter name', async () => {
      const metadata: ResourceOwnershipMetadata = {
        resourceType: ResourceType.POST,
        idParamName: 'postId',
      };
      const context = createMockExecutionContext(mockUser, {
        postId: 'post-123',
      });

      jest.spyOn(reflector, 'get').mockReturnValue(metadata);
      jest.spyOn(registry, 'getResource').mockResolvedValue(mockOwnedResource);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(registry.getResource).toHaveBeenCalledWith(
        ResourceType.POST,
        'post-123',
      );
    });
  });
});
