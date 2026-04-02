import { Test, TestingModule } from '@nestjs/testing';
import {
  OwnedResource,
  ResourceOwnershipProvider,
} from './resource-ownership.interface';
import { ResourceOwnershipRegistry } from './resource-ownership.registry';
import { ResourceType } from './resource-type.enum';

describe('ResourceOwnershipRegistry', () => {
  let registry: ResourceOwnershipRegistry;

  const mockResource: OwnedResource = {
    id: 'resource-123',
    author: {
      id: 'user-123',
    },
  };

  const mockProvider: ResourceOwnershipProvider = {
    findOneById: jest.fn().mockResolvedValue(mockResource),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourceOwnershipRegistry],
    }).compile();

    registry = module.get<ResourceOwnershipRegistry>(ResourceOwnershipRegistry);
  });

  describe('register', () => {
    it('should register a resource ownership provider', () => {
      expect(() =>
        registry.register(ResourceType.POST, mockProvider),
      ).not.toThrow();
    });

    it('should allow registering multiple resource types', () => {
      const commentProvider: ResourceOwnershipProvider = {
        findOneById: jest.fn(),
      };

      registry.register(ResourceType.POST, mockProvider);
      registry.register(ResourceType.COMMENT, commentProvider);

      expect(() =>
        registry.getResource(ResourceType.POST, 'test'),
      ).not.toThrow();
      expect(() =>
        registry.getResource(ResourceType.COMMENT, 'test'),
      ).not.toThrow();
    });

    it('should allow overwriting an existing provider', () => {
      const newProvider: ResourceOwnershipProvider = {
        findOneById: jest.fn().mockResolvedValue({
          id: 'new-resource',
          author: { id: 'new-user' },
        }),
      };

      registry.register(ResourceType.POST, mockProvider);
      registry.register(ResourceType.POST, newProvider);

      // Should use the new provider
      expect(registry.getResource(ResourceType.POST, 'test')).resolves.toEqual({
        id: 'new-resource',
        author: { id: 'new-user' },
      });
    });
  });

  describe('getResource', () => {
    beforeEach(() => {
      registry.register(ResourceType.POST, mockProvider);
    });

    it('should retrieve a resource by type and ID', async () => {
      const result = await registry.getResource(
        ResourceType.POST,
        'resource-123',
      );

      expect(result).toEqual(mockResource);
      expect(mockProvider.findOneById).toHaveBeenCalledWith('resource-123');
    });

    it('should throw error for unregistered resource type', async () => {
      await expect(
        registry.getResource(ResourceType.COMMENT, 'comment-123'),
      ).rejects.toThrow(
        'No ownership provider registered for resource type: comment',
      );
    });

    it('should propagate errors from the provider', async () => {
      const errorProvider: ResourceOwnershipProvider = {
        findOneById: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      registry.register(ResourceType.COMMENT, errorProvider);

      await expect(
        registry.getResource(ResourceType.COMMENT, 'comment-123'),
      ).rejects.toThrow('Database error');
    });
  });
});
