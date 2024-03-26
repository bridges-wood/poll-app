import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { extractAuthTokenFromHeader, getUserFromToken } from './utils';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
