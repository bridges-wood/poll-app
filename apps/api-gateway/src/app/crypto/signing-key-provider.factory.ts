import { GetSigningKeyFunction } from '@graphql-yoga/plugin-jwt';
import { Injectable, Logger } from '@nestjs/common';
import { JwksClient } from 'jwks-rsa';
import { EndpointsService } from '../endpoints/endpoints.service';
import { LoadedEndpoint } from '../endpoints/models/loaded-endpoint.model';

@Injectable()
export class SigningKeyProviderFactory {
  private readonly logger = new Logger(SigningKeyProviderFactory.name);
  constructor(private readonly endpointService: EndpointsService) {}

  build(): GetSigningKeyFunction {
    return async (kid) => {
      const jwksClients = this.endpointService
        .getAllLoadedEndpoints()
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
