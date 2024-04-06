import { gql } from '@apollo/client/core';
import { Injectable, Logger } from '@nestjs/common';
import { GraphQLCrossAppClient } from '@org/cross-app';
import { User } from '@org/typings';
import _ from 'lodash';

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
    if (_.isEmpty(token)) {
      throw new Error('Token is missing');
    }

    const payload = gql`
      query ValidateToken($token: String!) {
        validateToken(token: $token)
      }
    `;

    const res = await this.client.send<{ validateToken: User['id'] }>(payload, {
      variables: { token },
    });
    this.logger.debug(`Response for validateToken(${token})`, res);

    return res.data.validateToken;
  }
}
