import { cacheExchange, createClient, fetchExchange } from '@urql/core';

export const client = createClient({
  url:
    process.env.NODE_ENV === 'production'
      ? `https://localhost:${process.env['API_GATEWAY_SERVICE_PORT']}/graphql`
      : 'https://localhost:3000/graphql',
  requestPolicy: 'cache-first',
  exchanges: [cacheExchange, fetchExchange],
});
