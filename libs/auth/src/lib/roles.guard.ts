import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@org/graphql/nest';
import { Roles } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private logger = new Logger(RolesGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const ctx = GqlExecutionContext.create(context).getContext();
    const user: User = ctx.user;
    return this.matchRoles(roles, user);
  }

  protected matchRoles(roles: string[], user: User): boolean {
    // TODO - Implement role matching
    this.logger.debug(`Roles: ${roles}`);
    this.logger.debug(`User: ${user}`);
    return true;
  }
}
