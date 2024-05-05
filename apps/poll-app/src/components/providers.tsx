'use client';

import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import {
  UrqlProvider,
  createClient,
  fetchExchange,
  ssrExchange,
} from '@urql/next';
import { ThemeProvider } from 'next-themes';
import { parseCookies } from 'nookies';
import { FC, PropsWithChildren, useMemo } from 'react';

const Providers: FC<PropsWithChildren> = ({ children }) => {
  const [client, ssr] = useMemo(() => {
    const ssr = ssrExchange({ isClient: typeof window !== 'undefined' });

    const client = createClient({
      url:
        process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql',
      exchanges: [
        cacheExchange({}),
        authExchange(async (utils) => {
          const { token } = parseCookies();

          return {
            addAuthToOperation: (operation) => {
              if (!token) return operation;
              return utils.appendHeaders(operation, {
                Authorization: `Bearer ${token}`,
              });
            },
            didAuthError: (error) => {
              console.log(error.graphQLErrors.map((e) => e.message));
              return error.graphQLErrors.some(
                (e) => e.message === 'jwt expired',
              );
            },
            async refreshAuth() {
              console.log('Refreshing token');
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
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UrqlProvider client={client} ssr={ssr}>
        {children}
      </UrqlProvider>
    </ThemeProvider>
  );
};

export default Providers;
