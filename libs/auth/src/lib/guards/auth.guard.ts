import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { extractAuthTokenFromHeader, getUserFromToken } from '../utils';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const ctx = GqlExecutionContext.create(context).getContext();
    const request = ctx.req;
    try {
      const token = extractAuthTokenFromHeader(request);
      const user = await getUserFromToken(token);

      ctx.user = user; // Attach the user to the context
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException(error);
    }

    return true;
  }
}
