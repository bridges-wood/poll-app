import { createClient, fetchExchange } from '@urql/core';
import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import { registerUrql } from '@urql/next/rsc';
import { cookies } from 'next/headers';

const { getClient } = registerUrql(() => {
  return createClient({
    exchanges: [
      cacheExchange({}),
      authExchange(async (utils) => {
        const token = cookies().get('token')?.value;

        return {
          addAuthToOperation: (operation) => {
            if (!token) return operation;
            return utils.appendHeaders(operation, {
              Authorization: `Bearer ${token}`,
            });
          },
          didAuthError: (error) => {
            console.log(error.graphQLErrors.map((e) => e.message));
            return error.graphQLErrors.some((e) => e.message === 'jwt expired');
          },
          async refreshAuth() {
            console.log('Refreshing token');
          },
        };
      }),
      fetchExchange,
    ],
    url:
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql'
        : 'http://localhost:3000/graphql',
    requestPolicy: 'cache-and-network',
  });
});

export default getClient;
