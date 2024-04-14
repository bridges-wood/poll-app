import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { cookies } from 'next/headers';

export const authLink = setContext((_, { headers }) => {
  const token = cookies().get('token')?.value;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
    fetchOptions: {
      cache: 'no-store',
    },
  };
});

export const httpLink = new HttpLink({
  uri:
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_GRAPHQL_URL
      : 'http://localhost:3000/graphql',
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([authLink, httpLink]),
});

export default client;
