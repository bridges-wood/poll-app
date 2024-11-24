import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_INSTANCE } from '@org/cache';
import { GraphQLCrossAppClient } from '@org/cross-app';
import {
  ValidateTokenDocument,
  ValidateTokenQuery,
  ValidateTokenQueryVariables,
} from '@org/graphql';
import { DecodedIdToken, User } from '@org/typings';
import { Cacheable } from 'cacheable';
import { isEmpty } from 'lodash';

@Injectable()
export class CrossAppAuthService {
  private logger = new Logger(CrossAppAuthService.name);
  constructor(
    private client: GraphQLCrossAppClient,
    private jwtService: JwtService,
    @Inject(CACHE_INSTANCE) private cache: Cacheable,
  ) {}

  /**
   * Validates a JWT token and returns the decoded token, if the token is valid
   * @param token The JWT token to validate
   * @returns The user ID if the token is valid, otherwise throws an error
   */
  async validateToken(token: string | undefined): Promise<User['id']> {
    if (!token || isEmpty(token)) {
      throw new Error('Token is missing');
    }

    // Query cache for token
    this.logger.debug(`Validating token: ${token}`);
    const value = await this.cache.get(token);
    if (!isEmpty(value)) {
      this.logger.debug(`Found matching value in cache: ${value}`);
      return value as User['id'];
    }

    const res = await this.client.query<
      ValidateTokenQuery,
      ValidateTokenQueryVariables
    >(ValidateTokenDocument, { token });
    this.logger.debug(`Response for validateToken(${token})`, res);

    // Cache the token
    await this.cache.set(token, res.validateToken, this.getTtl(token));

    return res.validateToken;
  }

  /**
   * Gets the number of milliseconds until the token expires
   * @param token The token for which to calculate the TTL
   * @returns The number of milliseconds until the token expires
   */
  private getTtl(token: string): number {
    const decoded = this.jwtService.decode<DecodedIdToken>(token);
    if (!decoded) {
      throw new Error(`Could not decode token ${token}`);
    }

    return decoded.exp * 1000 - Date.now();
  }
}
