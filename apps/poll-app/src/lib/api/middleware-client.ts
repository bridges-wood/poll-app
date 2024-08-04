import { cacheExchange, createClient, fetchExchange } from '@urql/core';

export const client = createClient({
  url:
    process.env.NODE_ENV === 'production'
      ? `http://localhost:${process.env['API_GATEWAY_SERVICE_PORT']}/graphql`
      : 'http://localhost:3000/graphql',
  requestPolicy: 'cache-first',
  exchanges: [cacheExchange, fetchExchange],
});
