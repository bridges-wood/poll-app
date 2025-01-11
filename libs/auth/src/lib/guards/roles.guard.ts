import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { BaseLogger } from '@org/log';
import { User } from '@org/typings';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly logger: BaseLogger,
  ) {
    this.logger.setContext(RolesGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get(Roles, context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user: User = request.user;

    return this.matchRoles(requiredRoles, user);
  }

  protected matchRoles(roles: string[], user: Pick<User, 'roles'>): boolean {
    this.logger.debug(`Permitted roles: ${roles}`);
    this.logger.debug(`User roles: ${user.roles}`);
    return user.roles.some((role) => roles.includes(role));
  }
}
