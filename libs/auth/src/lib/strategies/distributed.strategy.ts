import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyRequest as Request } from 'fastify';
import { Strategy } from 'passport-custom';

import { User } from '@org/typings';
import { GraphQLParams } from 'graphql-yoga';
import { CrossAppAuthService } from '../cross-app/cross-app.auth.service';
import { extractAuthTokenFromHeader } from '../utils';

@Injectable()
export class DistributedStrategy extends PassportStrategy(
  Strategy,
  'distributed',
) {
  constructor(private crossAppAuthService: CrossAppAuthService) {
    super();
  }

  async validate(req: Request): Promise<Pick<User, 'id'>> {
    // When we're in production, the request is signed by the gateway, so we can trust it
    const body = req.body as GraphQLParams;
    if (this.isTrusted(body)) {
      // If the request is trusted, we can trust the user data
      return {
        id: body.extensions?.['sub'],
      };
    } else {
      // When we're in development, we need to validate the token
      const token = extractAuthTokenFromHeader(req);
      const user = await this.crossAppAuthService.validateToken(token);

      return {
        id: user,
      };
    }
  }

  private isTrusted(params: GraphQLParams): boolean {
    // Check that the extensions field of the request contains the trusted field
    return params.extensions?.['trusted'] === true;
  }
}
