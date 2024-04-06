import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyRequest as Request } from 'fastify';
import { Strategy } from 'passport-custom';

import { CrossAppAuthService } from '../cross-app/cross-app.auth.service';
import { CrossAppUserService } from '../cross-app/cross-app.user.service';
import { extractAuthTokenFromHeader } from '../utils';

@Injectable()
export class DistributedStrategy extends PassportStrategy(
  Strategy,
  'distributed',
) {
  constructor(
    private crossAppAuthService: CrossAppAuthService,
    private crossAppUserService: CrossAppUserService,
  ) {
    super();
  }

  async validate(req: Request) {
    // Extract the token from the request and validate it
    const token = extractAuthTokenFromHeader(req);
    const userId = await this.crossAppAuthService.validateToken(token);

    // TODO let the service access the user data without being logged in
    const user = await this.crossAppUserService.fetchAuthData(userId);
    return user;
  }
}
