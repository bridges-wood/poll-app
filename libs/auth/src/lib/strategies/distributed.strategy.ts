import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { CACHE_INSTANCE } from '@org/cache';
import { ClientConfigService } from '@org/config';
import { BaseLogger } from '@org/log';
import type { DecodedIdToken, TrustedParams, User } from '@org/typings';
import assert from 'assert';
import { Cacheable } from 'cacheable';
import type { FastifyRequest as Request } from 'fastify';
import type { GraphQLParams } from 'graphql-yoga';
import { Strategy } from 'passport-custom';
import { CrossAppAuthService } from '../cross-app/cross-app.auth.service';
import { extractAuthTokenFromHeader } from '../utils';

@Injectable()
export class DistributedStrategy extends PassportStrategy(
  Strategy,
  'distributed',
) {
  constructor(
    private readonly clientConfigService: ClientConfigService,
    private readonly crossAppAuthService: CrossAppAuthService,
    private readonly jwtService: JwtService,
    private readonly logger: BaseLogger,
    @Inject(CACHE_INSTANCE) private readonly cache: Cacheable,
  ) {
    super();
    this.logger.setContext(DistributedStrategy.name);
  }

  async validate(req: Request): Promise<Pick<User, 'id' | 'roles'>> {
    if (
      this.clientConfigService.isDev() &&
      this.clientConfigService.bypassAuth
    ) {
      this.logger.warn('⚠️ Bypassing authentication');
      return {
        id: '00000000-0000-0000-0000-000000000000',
        roles: ['admin'],
      };
    }

    // When we're in production, the request is signed by the gateway, so we can trust it
    const body = req.body as GraphQLParams;
    if (this.isTrusted(body)) {
      // If the request is trusted, we can trust the user data
      return {
        id: body.extensions['sub'],
        roles: body.extensions['roles'],
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

  private isTrusted(params: GraphQLParams): params is TrustedParams {
    // Check that the extensions field of the request contains the trusted field
    return params.extensions?.['trusted'] === true;
  }

  private getTtl(token: string): number {
    const decoded: DecodedIdToken = this.jwtService.decode(token);
    assert(decoded?.exp, 'Token does not have an expiry date');
    return decoded.exp * 1000 - Date.now();
  }
}
