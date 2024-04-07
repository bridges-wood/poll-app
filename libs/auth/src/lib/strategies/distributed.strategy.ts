import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyRequest as Request } from 'fastify';
import { Strategy } from 'passport-custom';

import { User } from '@org/typings';
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
    // Extract the token from the request and validate it
    const token = extractAuthTokenFromHeader(req);
    const id = await this.crossAppAuthService.validateToken(token);

    // TODO let the service access the user data without being logged in
    return { id };
  }
}
