import schema from '@org/graphql/schema.json';
import { createClient, fetchExchange } from '@urql/core';
import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import { registerUrql } from '@urql/next/rsc';
import { cookies } from 'next/headers';

const { getClient } = registerUrql(() => {
  const url = 'https://localhost:3000/graphql';

  console.info('Creating client with url:', url);
  return createClient({
    exchanges: [
      cacheExchange({
        keys: {
          MultipleChoiceQuestion: () => null,
        },
        schema,
      }),
      authExchange(async (utils) => {
        const token = (await cookies()).get('token')?.value;

        return {
          addAuthToOperation: (operation) => {
            if (!token) return operation;
            return utils.appendHeaders(operation, {
              authorization: `Bearer ${token}`,
            });
          },
          didAuthError: (error) => {
            console.error(error.graphQLErrors.map((e) => e.message));
            return error.graphQLErrors.some((e) => e.message === 'jwt expired');
          },
          async refreshAuth() {
            console.info('Refreshing token');
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
