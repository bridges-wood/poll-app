import { createClient, fetchExchange } from '@urql/core';
import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import { registerUrql } from '@urql/next/rsc';
import { cookies } from 'next/headers';

const FALLBACK_URL = 'http://localhost:3000/graphql';
// TODO update cache exchange to use persisted queries

const makeClient = () => {
  return createClient({
    url:
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_GRAPHQL_URL || FALLBACK_URL
        : FALLBACK_URL,
    requestPolicy: 'cache-and-network',
    exchanges: [
      cacheExchange({}),
      authExchange(async (utils) => {
        const requestCookies = cookies();
        const token = requestCookies.get('token')?.value;

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
  });
};

const { getClient } = registerUrql(makeClient);

export default getClient;
