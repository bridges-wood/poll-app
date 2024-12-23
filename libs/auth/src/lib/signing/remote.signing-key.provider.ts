import { GetSigningKeyFunction } from '@graphql-yoga/plugin-jwt';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_INSTANCE } from '@org/cache';
import { GraphQLCrossAppClient } from '@org/cross-app';
import {
  FindEndpointsWithJwksDocument,
  FindEndpointsWithJwksQuery,
  FindEndpointsWithJwksQueryVariables,
} from '@org/graphql';
import { Cacheable } from 'cacheable';
import { JwksClient } from 'jwks-rsa';
import { JWKS_URI_CACHE_KEY } from './constants';
import { SigningKeyProvider } from './signing-key.provider';

@Injectable()
export class RemoteSigningKeyProvider implements SigningKeyProvider {
  private readonly logger = new Logger(RemoteSigningKeyProvider.name);
  constructor(
    private readonly client: GraphQLCrossAppClient,
    @Inject(CACHE_INSTANCE) private cache: Cacheable,
  ) {}

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
    // Query cache for jwks URIs
    const value = await this.cache.get(JWKS_URI_CACHE_KEY);
    if (value) {
      this.logger.debug(`Found stored JWKS URIs in cache, skipping query`);
      return value as string[];
    }

    const res = await this.client.query<
      FindEndpointsWithJwksQuery,
      FindEndpointsWithJwksQueryVariables
    >(FindEndpointsWithJwksDocument, {});
    this.logger.debug(`Response for findJwksEndpoints()`, res);

    const endpointsWithJwks = res.endpoints.filter(this.hasJwksUri);
    if (endpointsWithJwks.length === 0) {
      throw new Error('No endpoints with JWKS URIs found');
    }

    // Cache the jwks URIs
    const jwksUris = endpointsWithJwks.map((e) => e.jwksUri);
    await this.cache.set(JWKS_URI_CACHE_KEY, jwksUris, '1d');
    return jwksUris;
  }

  private hasJwksUri<T extends { jwksUri?: string | null }>(
    endpoint: T,
  ): endpoint is T & { jwksUri: string } {
    return !!endpoint.jwksUri;
  }
}
