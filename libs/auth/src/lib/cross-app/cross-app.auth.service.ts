import { Injectable, Logger } from '@nestjs/common';
import { GraphQLCrossAppClient } from '@org/cross-app';
import {
  ValidateTokenDocument,
  ValidateTokenQuery,
  ValidateTokenQueryVariables,
} from '@org/graphql';
import { User } from '@org/typings';
import { isEmpty } from 'lodash';

@Injectable()
export class CrossAppAuthService {
  private logger = new Logger(CrossAppAuthService.name);
  constructor(private client: GraphQLCrossAppClient) {}

  /**
   * Validates a JWT token and returns the decoded token, if the token is valid
   * @param token The JWT token to validate
   * @returns The user ID if the token is valid, otherwise throws an error
   */
  async validateToken(token: string | undefined): Promise<User['id']> {
    if (!token || isEmpty(token)) {
      throw new Error('Token is missing');
    }

    const res = await this.client.query<
      ValidateTokenQuery,
      ValidateTokenQueryVariables
    >(ValidateTokenDocument, { token });
    this.logger.debug(`Response for validateToken(${token})`, res);

    return res.validateToken;
  }
}
