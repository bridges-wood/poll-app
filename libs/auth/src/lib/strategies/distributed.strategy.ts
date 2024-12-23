import { Inject, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyRequest as Request } from 'fastify';
import { Strategy } from 'passport-custom';

import { JwtService } from '@nestjs/jwt';
import { CACHE_INSTANCE } from '@org/cache';
import { User } from '@org/typings';
import { Cacheable } from 'cacheable';
import { GraphQLParams } from 'graphql-yoga';
import { CrossAppAuthService } from '../cross-app/cross-app.auth.service';
import { extractAuthTokenFromHeader } from '../utils';

@Injectable()
export class DistributedStrategy extends PassportStrategy(
  Strategy,
  'distributed',
) {
  private readonly logger = new Logger(DistributedStrategy.name);
  constructor(
    private readonly crossAppAuthService: CrossAppAuthService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_INSTANCE) private readonly cache: Cacheable,
  ) {
    super();
  }

  async validate(req: Request): Promise<Pick<User, 'id' | 'roles'>> {
    // When we're in production, the request is signed by the gateway, so we can trust it
    const body = req.body as GraphQLParams;
    if (this.isTrusted(body)) {
      // If the request is trusted, we can trust the user data
      return {
        id: body.extensions?.['sub'],
        roles: body.extensions?.['roles'],
      };
    } else {
      // When we're in development, we need to validate the token
      const token = extractAuthTokenFromHeader(req);
      if (!token) throw new Error('Token is missing');

      // Check the cache for the token
      const value = await this.cache.get(token);
      if (value) {
        this.logger.debug(`Found user object in cache for token ${token}`);
        return value as Pick<User, 'id' | 'roles'>;
      } else {
        this.logger.debug(`No user object found in cache for token ${token}`);
        // Validate the token
        const user = await this.crossAppAuthService.validateToken(token);
        // Cache the response
        await this.cache.set(token, user, this.getTtl(token));
        return user;
      }
    }
  }

  private isTrusted(params: GraphQLParams): boolean {
    // Check that the extensions field of the request contains the trusted field
    return params.extensions?.['trusted'] === true;
  }

  private getTtl(token: string): number {
    return this.jwtService.decode(token)?.exp * 1000 - Date.now();
  }
}
