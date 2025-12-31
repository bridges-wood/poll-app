import { Inject, Injectable } from '@nestjs/common';
import EnvironmentConfigFactory, {
  EnvironmentConfig,
} from '@org/config/environment.config.factory';
import { GraphQLCrossAppClient, RestCrossAppClient } from '@org/cross-app';
import {
  SelfRegisteredDocument,
  SelfRegisteredQuery,
  SelfRegisteredQueryVariables,
} from '@org/graphql';
import { BaseLogger } from '@org/log';
import { isEmpty } from 'lodash';

@Injectable()
export class CrossAppHealthService {
  constructor(
    @Inject(EnvironmentConfigFactory.KEY)
    private readonly environmentConfig: EnvironmentConfig,
    private readonly restClient: RestCrossAppClient,
    private readonly graphqlClient: GraphQLCrossAppClient,
    private readonly logger: BaseLogger,
  ) {
    this.logger.setContext(CrossAppHealthService.name);
  }

  async checkIn(): Promise<boolean> {
    this.logger.debug(`Checking in with ${this.restClient.url}/health`);
    const { status } = await this.restClient.query('/health');

    if (status !== 200)
      throw new Error(`Cross-app health check failed with status ${status}`);

    const response = await this.graphqlClient.query<
      SelfRegisteredQuery,
      SelfRegisteredQueryVariables
    >(SelfRegisteredDocument, { name: this.environmentConfig.name });

    if (isEmpty(response.endpoints)) throw new Error('No registration found');

    return true;
  }
}
