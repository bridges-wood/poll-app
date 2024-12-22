import { Injectable, Logger } from '@nestjs/common';
import { GraphQLCrossAppClient } from '@org/cross-app';
import {
  FetchAuthDataDocument,
  FetchAuthDataQuery,
  FetchAuthDataQueryVariables,
} from '@org/graphql';
import { User } from '@org/typings';

@Injectable()
export class CrossAppUserService {
  private logger = new Logger(CrossAppUserService.name);
  constructor(private client: GraphQLCrossAppClient) {}

  async fetchAuthData(
    id: string,
    token: string | undefined,
  ): Promise<Pick<User, 'id' | 'roles'>> {
    this.logger.debug(`Fetching auth data for user with id: ${id}`);
    if (token) {
      this.client = this.client.impersonating(token);
    }

    const res = await this.client.query<
      FetchAuthDataQuery,
      FetchAuthDataQueryVariables
    >(FetchAuthDataDocument, { id });
    this.logger.debug(`Response for fetchAuthData(${id})`, res);

    return res.user;
  }
}
