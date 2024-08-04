import { createClient, fetchExchange } from '@urql/core';
import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import { registerUrql } from '@urql/next/rsc';
import { cookies } from 'next/headers';

const { getClient } = registerUrql(() => {
  const url =
    process.env.NODE_ENV === 'production'
      ? `http://localhost:${process.env['API_GATEWAY_SERVICE_PORT']}/graphql`
      : 'http://localhost:3000/graphql';

  console.log('Creating client with url:', url);
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
    url,
    requestPolicy: 'cache-and-network',
  });
});

export default getClient;
