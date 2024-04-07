'use client';

import { ApolloLink, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import {
  ApolloNextAppProvider,
  NextSSRApolloClient,
  NextSSRInMemoryCache,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support/ssr';

import { ComponentProps, FC, PropsWithChildren } from 'react';

const makeClient: ComponentProps<
  typeof ApolloNextAppProvider
>['makeClient'] = () => {
  const uri =
    process.env.NODE_ENV === 'production'
      ? process.env.GRAPHQL_URL
      : 'http://localhost:3000/graphql';

  const httpLink = new HttpLink({
    uri,
    fetchOptions: { cache: 'no-store' },
  });

  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${JSON.parse(token)}` : '',
      },
    };
  });

  const combinedLink = authLink.concat(httpLink);

  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(),
    link:
      typeof window === 'undefined'
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            combinedLink,
          ])
        : combinedLink,
  });
};

const ApolloWrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
};

export default ApolloWrapper;
