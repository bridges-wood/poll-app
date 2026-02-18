import { SetMetadata } from '@nestjs/common';

export const RESOURCE_OWNERSHIP_KEY = 'resourceOwnership';

export interface ResourceOwnershipMetadata {
  resourceType: string;
  idParamName: string;
}

/**
 * Decorator to mark a route as requiring resource ownership.
 * Use with OwnershipGuard to ensure only the resource owner can access the route.
 *
 * @param resourceType - The type of resource (e.g., 'post', 'comment')
 * @param idParamName - The name of the parameter containing the resource ID (default: 'id')
 *
 * @example
 * ```typescript
 * @ResourceOwner('post', 'id')
 * @Mutation(() => Boolean)
 * async deletePost(@Args('id') id: string): Promise<boolean> {
 *   return this.postsService.deleteOne(id);
 * }
 * ```
 */
export const ResourceOwner = (
  resourceType: string,
  idParamName = 'id',
): ReturnType<typeof SetMetadata> =>
  SetMetadata(RESOURCE_OWNERSHIP_KEY, {
    resourceType,
    idParamName,
  } as ResourceOwnershipMetadata);
