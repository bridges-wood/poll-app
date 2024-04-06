import { gql } from '@apollo/client/core';
import { Injectable, Logger } from '@nestjs/common';
import { GraphQLCrossAppClient } from '@org/cross-app';
import { User } from '@org/typings';

@Injectable()
export class CrossAppUserService {
  private logger = new Logger(CrossAppUserService.name);
  constructor(private client: GraphQLCrossAppClient) {}

  async checkUserExists(id: string): Promise<Pick<User, 'id'>> {
    this.logger.debug(`Checking if user exists with id: ${id}`);
    const payload = gql`
      query CheckUserExists($id: String!) {
        user(id: $id) {
          id
        }
      }
    `;

    const res = await this.client.send<{ user: Pick<User, 'id'> }>(payload, {
      variables: { id },
    });
    this.logger.debug(`Response for checkUserExists(${id})`, res);

    return { id: res.data.user.id };
  }
}
