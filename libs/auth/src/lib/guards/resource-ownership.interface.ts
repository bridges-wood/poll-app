export interface OwnedResource {
  id: string;
  author: {
    id: string;
  };
}

/**
 * Interface for services that provide resource ownership information.
 * Implement this to allow OwnershipGuard to check ownership for your resources.
 */
export interface ResourceOwnershipProvider {
  /**
   * Get a resource by ID with its ownership information
   * @param id - The resource ID
   * @returns The resource with at least id and author.id fields
   * @throws NotFoundException if resource doesn't exist
   */
  findOneById(id: string): Promise<OwnedResource>;
}

/**
 * Token for injecting the resource ownership registry
 */
export const RESOURCE_OWNERSHIP_REGISTRY = Symbol(
  'RESOURCE_OWNERSHIP_REGISTRY',
);

/**
 * Registry that maps resource types to their ownership providers.
 * Used by OwnershipGuard to fetch and verify resource ownership.
 */
export interface ResourceOwnershipRegistry {
  /**
   * Register a resource ownership provider
   * @param resourceType - The type of resource (e.g., 'post', 'comment')
   * @param provider - The service that provides ownership information
   */
  register(resourceType: string, provider: ResourceOwnershipProvider): void;

  /**
   * Get a resource by type and ID
   * @param resourceType - The type of resource
   * @param id - The resource ID
   * @returns The resource with ownership information
   * @throws Error if resource type is not registered
   */
  getResource(resourceType: string, id: string): Promise<OwnedResource>;
}
