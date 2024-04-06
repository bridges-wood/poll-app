import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@org/typings';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private logger = new Logger(RolesGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;
    return this.matchRoles(roles, user);
  }

  protected matchRoles(roles: string[], user: User): boolean {
    this.logger.debug(`Permitted roles: ${roles}`);
    this.logger.debug(`User roles: ${user.roles}`);
    return user.roles.some((role) => roles.includes(role));
  }
}
