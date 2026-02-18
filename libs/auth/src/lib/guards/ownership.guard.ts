import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { BaseLogger } from '@org/log';
import { User } from '@org/typings';
import {
  RESOURCE_OWNERSHIP_KEY,
  ResourceOwnershipMetadata,
} from '../decorators/resource-owner.decorator';
import { ResourceOwnershipRegistry } from './resource-ownership.registry';

/**
 * Guard that checks if the authenticated user owns the requested resource.
 * Use with @ResourceOwner() decorator to specify resource type and ID parameter.
 *
 * @example
 * ```typescript
 * @UseGuards(OwnershipGuard)
 * @ResourceOwner('post', 'id')
 * @Mutation(() => Boolean)
 * async deletePost(@Args('id') id: string): Promise<boolean> {
 *   return this.postsService.deleteOne(id);
 * }
 * ```
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly resourceRegistry: ResourceOwnershipRegistry,
    private readonly logger: BaseLogger,
  ) {
    this.logger.setContext(OwnershipGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.get<ResourceOwnershipMetadata>(
      RESOURCE_OWNERSHIP_KEY,
      context.getHandler(),
    );

    if (!metadata) {
      return true;
    }

    const { resourceType, idParamName } = metadata;

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user: User = request.user;

    if (!user) {
      this.logger.warn(
        `Ownership check failed: no authenticated user for ${resourceType}`,
      );
      throw new ForbiddenException(
        'You must be authenticated to access this resource',
      );
    }

    const args = ctx.getArgs();
    const resourceId = args[idParamName];

    if (!resourceId) {
      this.logger.error(
        `Ownership check failed: no ${idParamName} parameter found in args`,
      );
      throw new ForbiddenException('Resource ID not provided');
    }

    try {
      const resource = await this.resourceRegistry.getResource(
        resourceType,
        resourceId,
      );

      if (resource.author.id !== user.id) {
        this.logger.warn(
          `User ${user.id} attempted to access ${resourceType} ${resourceId} owned by ${resource.author.id}`,
        );
        throw new ForbiddenException(
          'You do not have permission to access this resource',
        );
      }

      this.logger.debug(
        `User ${user.id} authorized for ${resourceType} ${resourceId}`,
      );
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(
        `Error checking ownership for ${resourceType} ${resourceId}: ${error.message}`,
      );
      throw new ForbiddenException('Unable to verify resource ownership');
    }
  }
}
