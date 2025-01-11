import { GetSigningKeyFunction } from '@graphql-yoga/plugin-jwt';
import { Injectable } from '@nestjs/common';
import { SigningKeyProvider } from '@org/auth';
import { BaseLogger } from '@org/log';
import { JwksClient } from 'jwks-rsa';
import { EndpointsService } from '../endpoints/endpoints.service';
import { LoadedEndpoint } from '../endpoints/models/loaded-endpoint.model';

@Injectable()
export class LocalSigningKeyProvider implements SigningKeyProvider {
  constructor(
    private readonly endpointService: EndpointsService,
    private readonly logger: BaseLogger,
  ) {
    this.logger.setContext(LocalSigningKeyProvider.name);
  }

  build(): GetSigningKeyFunction {
    return async (kid) => {
      const jwksClients = this.endpointService
        .getEndpoints()
        .filter(this.isJwksEndpoint)
        .map((e) => new JwksClient({ ...e }));

      this.logger.debug(`Built ${jwksClients.length} JwksClients`);

      return Promise.any(
        jwksClients.map((client) => client.getSigningKey(kid)),
      )?.then((r) => r.getPublicKey());
    };
  }

  private isJwksEndpoint<T extends LoadedEndpoint>(
    endpoint: T,
  ): endpoint is T & { jwksUri: string } {
    return !!endpoint.jwksUri;
  }
}
