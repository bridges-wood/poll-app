import { GetSigningKeyFunction } from '@graphql-yoga/plugin-jwt';
import { Injectable, Logger } from '@nestjs/common';
import { GraphQLCrossAppClient } from '@org/cross-app';
import {
  FindEndpointsWithJwksDocument,
  FindEndpointsWithJwksQuery,
  FindEndpointsWithJwksQueryVariables,
} from '@org/graphql';
import { JwksClient } from 'jwks-rsa';
import { SigningKeyProvider } from './signing-key.provider';

@Injectable()
export class RemoteSigningKeyProvider implements SigningKeyProvider {
  private readonly logger = new Logger(RemoteSigningKeyProvider.name);
  constructor(private readonly client: GraphQLCrossAppClient) {}

  public build(): GetSigningKeyFunction {
    return async (kid) => {
      const jwksUris = await this.findJwksUris();
      const jwksClients = jwksUris.map(
        (uri) => new JwksClient({ jwksUri: uri }),
      );

      this.logger.debug(`Built ${jwksClients.length} JwksClients`);

      return Promise.any(
        jwksClients.map((client) => client.getSigningKey(kid)),
      )?.then((r) => r.getPublicKey());
    };
  }

  async findJwksUris(): Promise<string[]> {
    const res = await this.client.query<
      FindEndpointsWithJwksQuery,
      FindEndpointsWithJwksQueryVariables
    >(FindEndpointsWithJwksDocument, {});
    this.logger.debug(`Response for findJwksEndpoints()`, res);

    const endpointsWithJwks = res.endpoints.filter(this.hasJwksUri);
    if (endpointsWithJwks.length === 0) {
      throw new Error('No endpoints with JWKS URIs found');
    }

    return endpointsWithJwks.map((e) => e.jwksUri);
  }

  private hasJwksUri<T extends { jwksUri?: string | null }>(
    endpoint: T,
  ): endpoint is T & { jwksUri: string } {
    return !!endpoint.jwksUri;
  }
}
