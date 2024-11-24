'use client';
import schema from '@org/graphql/schema.json';
import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import {
  Operation,
  UrqlProvider,
  createClient,
  fetchExchange,
  ssrExchange,
} from '@urql/next';
import { parseCookies } from 'nookies';
import { FC, PropsWithChildren, useMemo } from 'react';

const GraphQLProvider: FC<PropsWithChildren> = ({ children }) => {
  const [client, ssr] = useMemo(() => {
    const ssr = ssrExchange({ isClient: typeof window !== 'undefined' });

    const client = createClient({
      url:
        process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql',
      exchanges: [
        cacheExchange({
          keys: {
            MultipleChoiceQuestion: () => null,
          },
          schema,
        }),
        authExchange(async (utils) => {
          return {
            willAuthError: (operation) => {
              const token = getToken(operation);

              if (!token) return true;
              return false;
            },
            addAuthToOperation: (operation) => {
              const token = getToken(operation);

              if (!token) return operation;
              return utils.appendHeaders(operation, {
                Authorization: `Bearer ${token}`,
              });
            },
            didAuthError: (error) => {
              return error.graphQLErrors.some(
                (e) => e.message === 'jwt expired',
              );
            },
            async refreshAuth() {
              console.log('Refreshing token - Not Implemented');
            },
          };
        }),
        ssr,
        fetchExchange,
      ],
    });

    return [client, ssr];
  }, []);
  return (
    <UrqlProvider client={client} ssr={ssr}>
      {children}
    </UrqlProvider>
  );
};

const getToken = (operation: Operation): string | undefined | null => {
  const contextToken = operation.context.token as string | undefined | null;

  if (contextToken !== undefined) return contextToken;
  return parseCookies().token;
};

export default GraphQLProvider;
