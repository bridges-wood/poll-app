import { FactoryProvider } from '@nestjs/common';
import { ConfigTokens } from '../tokens';

export const GatewayUrlProvider: FactoryProvider = {
  provide: ConfigTokens.GATEWAY_URL,
  useFactory: async () => {
    if (process.env['NODE_ENV'] === 'development') {
      return 'https://localhost:3000/graphql';
    }

    return `https://localhost:${process.env['API_GATEWAY_SERVICE_PORT']}/graphql`;
  },
};
