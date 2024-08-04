import { Injectable, Logger } from '@nestjs/common';
import { GraphQLCrossAppClient } from '@org/cross-app';
import { User } from '@org/typings';
import gql from 'graphql-tag';

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

    const res = await this.client.query<
      { user: Pick<User, 'id' | 'roles'> },
      { id: string }
    >(payload, { id });
    this.logger.debug(`Response for fetchAuthData(${id})`, res);

    return res.user;
  }
}
