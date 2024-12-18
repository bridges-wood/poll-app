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
    // At this point, we know that the request is from the gateway
    const body = req.body as GraphQLParams;
    if (this.isTrusted(body)) {
      // If the request is trusted, we can trust the user data
      return {
        id: body.extensions?.['sub'],
      };
    } else {
      // TODO - Implement alternative authentication mechanism
      throw new Error('Unauthorized');
    }
  }

  private isTrusted(params: GraphQLParams): boolean {
    // Check that the extensions field of the request contains the trusted field
    return params.extensions?.['trusted'] === true;
  }
}
