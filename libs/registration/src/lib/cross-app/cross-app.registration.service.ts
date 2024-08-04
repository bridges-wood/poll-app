import { Injectable, Logger } from '@nestjs/common';
import { GraphQLCrossAppClient } from '@org/cross-app';
import {
  DeRegisterServiceDocument,
  DeRegisterServiceMutation,
  DeRegisterServiceMutationVariables,
  RegisterServiceDocument,
  RegisterServiceMutation,
  RegisterServiceMutationVariables,
} from '@org/graphql';
import ip from 'ip';

@Injectable()
export class CrossAppRegistrationService {
  private logger = new Logger(CrossAppRegistrationService.name);
  constructor(private client: GraphQLCrossAppClient) {}

  /**
   * Register a service with the GraphQL gateway
   */
  async register(name: string, port: number): Promise<boolean> {
    const res = await this.client.mutate<
      RegisterServiceMutation,
      RegisterServiceMutationVariables
    >(RegisterServiceDocument, {
      args: {
        name: name,
        url: `http://${ip.address()}:${port}/graphql`,
      },
    });

    return res.addEndpoint.success;
  }

  async unregister(name: string): Promise<boolean> {
    const res = await this.client.mutate<
      DeRegisterServiceMutation,
      DeRegisterServiceMutationVariables
    >(DeRegisterServiceDocument, {
      name: name,
    });

    this.logger.debug(`Response for deRegisterService`, res);
    return res.removeEndpoint.success;
  }
}
