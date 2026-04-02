import { SetMetadata } from '@nestjs/common';
import { ResourceType, ResourceTypeName } from '../guards/resource-type.enum';

export const RESOURCE_OWNERSHIP_KEY = 'resourceOwnership';

export interface ResourceOwnershipMetadata {
  resourceType: ResourceTypeName;
  idParamName: string;
}

/**
 * Decorator to mark a route as requiring resource ownership.
 * Use with OwnershipGuard to ensure only the resource owner can access the route.
 *
 * @param resourceType - The type of resource (e.g., ResourceType.POST)
 * @param idParamName - The name of the parameter containing the resource ID (default: 'id')
 *
 * @example
 * ```typescript
 * @ResourceOwner(ResourceType.POST, 'id')
 * @Mutation(() => Boolean)
 * async deletePost(@Args('id') id: string): Promise<boolean> {
 *   return this.postsService.deleteOne(id);
 * }
 * ```
 */
export const ResourceOwner = (
  resourceType: ResourceType | ResourceTypeName,
  idParamName = 'id',
): ReturnType<typeof SetMetadata> => {
  const typeValue = typeof resourceType === 'string' ? resourceType : (resourceType as string);
  return SetMetadata(RESOURCE_OWNERSHIP_KEY, {
    resourceType: typeValue,
    idParamName,
  } as ResourceOwnershipMetadata);
};
