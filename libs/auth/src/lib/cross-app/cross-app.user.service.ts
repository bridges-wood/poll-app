import { gql } from '@apollo/client/core';
import { Injectable, Logger } from '@nestjs/common';
import { GraphQLCrossAppClient } from '@org/cross-app';
import { User } from '@org/typings';

@Injectable()
export class CrossAppUserService {
  private logger = new Logger(CrossAppUserService.name);
  constructor(private client: GraphQLCrossAppClient) {}

  async fetchAuthData(id: string): Promise<Pick<User, 'id' | 'roles'>> {
    this.logger.debug(`Fetching auth data for user with id: ${id}`);

    const payload = gql`
      query FetchAuthData($id: String!) {
        user(id: $id) {
          id
          roles
        }
      }
    `;

    const res = await this.client.send<{ user: Pick<User, 'id' | 'roles'> }>(
      payload,
      {
        variables: { id },
      },
    );
    this.logger.debug(`Response for fetchAuthData(${id})`, res);

    return res.data.user;
  }
}
