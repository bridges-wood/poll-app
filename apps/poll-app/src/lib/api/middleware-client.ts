import { cacheExchange, createClient, fetchExchange } from '@urql/core';

const FALLBACK_URL = 'http://localhost:3000/graphql';

export const client = createClient({
  url:
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_GRAPHQL_URL || FALLBACK_URL
      : FALLBACK_URL,
  requestPolicy: 'cache-first',
  exchanges: [cacheExchange, fetchExchange],
});
