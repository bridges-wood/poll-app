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
import { exec } from 'child_process';
import { backOff } from 'exponential-backoff';
import { promisify } from 'util';

@Injectable()
export class CrossAppRegistrationService {
  private logger = new Logger(CrossAppRegistrationService.name);
  constructor(private client: GraphQLCrossAppClient) {}

  /**
   * Register a service with the GraphQL gateway
   */
  async register(
    name: string,
    port: number,
    hasJwks = false,
  ): Promise<RegisterServiceMutation['addEndpoint']> {
    const hash = await this.getHash();
    this.logger.debug(`Found latest commit hash: ${hash}`);

    const res = await backOff(
      () =>
        this.client.mutate<
          RegisterServiceMutation,
          RegisterServiceMutationVariables
        >(RegisterServiceDocument, {
          args: {
            name: name,
            hash,
            url: `https://localhost:${port}/graphql`,
            jwksUri: hasJwks
              ? `https://localhost:${port}/.well-known/jwks.json`
              : undefined,
          },
        }),
      {
        numOfAttempts: 10,
        maxDelay: 10000,
        retry: (e, attemptNumber) => {
          this.logger.warn(
            `Attempt ${attemptNumber} failed. Reason: ${e.message}`,
          );
          return true;
        },
      },
    );

    return res.addEndpoint;
  }

  private async getHash(): Promise<string> {
    const { stdout, stderr } = await promisify(exec)('git rev-parse HEAD');
    if (!stdout) throw new Error(stderr);

    return stdout.trim();
  }

  async unregister(name: string): Promise<boolean> {
    const res = await this.client.mutate<
      DeRegisterServiceMutation,
      DeRegisterServiceMutationVariables
    >(DeRegisterServiceDocument, {
      name: name,
    });

    return res.removeEndpoint.success;
  }
}
