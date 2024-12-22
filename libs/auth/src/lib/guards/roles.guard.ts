import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@org/typings';
import { CrossAppUserService } from '../cross-app/cross-app.user.service';
import { Roles } from '../decorators/roles.decorator';
import { extractAuthTokenFromHeader } from '../utils';

@Injectable()
export class RolesGuard implements CanActivate {
  private logger = new Logger(RolesGuard.name);
  constructor(
    private reflector: Reflector,
    private crossAppUserService: CrossAppUserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // TODO determine if this is fired unnecessarily
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const { id }: User = request.user;

    const token = extractAuthTokenFromHeader(request);
    const user = await this.crossAppUserService.fetchAuthData(id, token);

    return this.matchRoles(roles, user);
  }

  protected matchRoles(roles: string[], user: Pick<User, 'roles'>): boolean {
    this.logger.debug(`Permitted roles: ${roles}`);
    this.logger.debug(`User roles: ${user.roles}`);
    return user.roles.some((role) => roles.includes(role));
  }
}
