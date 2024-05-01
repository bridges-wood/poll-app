import {
  Exchange,
  SSRExchange,
  createClient,
  fetchExchange,
  ssrExchange,
} from '@urql/core';
import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';

const FALLBACK_URL = 'http://localhost:3000/graphql';

interface ClientFactoryOptions {
  isClientSide: boolean;
}

export class ClientFactory {
  private isClientSide: boolean;
  private ssr: SSRExchange | undefined;

  constructor({ isClientSide }: ClientFactoryOptions) {
    this.isClientSide = isClientSide;
  }

  public getClient() {
    let exchanges: Exchange[] = [
      cacheExchange({}),
      authExchange(async (utils) => {
        let token: string | undefined = undefined;
        if (!this.isClientSide) {
          const { cookies } = await import('next/headers');
          const requestCookies = cookies();
          token = requestCookies.get('token')?.value;
        } else {
          const { parseCookies } = await import('nookies');
          const { token: cookieToken } = parseCookies();
          token = cookieToken;
        }
        console.log('token', token);

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
    ];

    if (this?.isClientSide) {
      this.ssr = ssrExchange({
        isClient: typeof window !== 'undefined',
      });
      exchanges = exchanges.splice(1, 0, this.ssr);
    }

    return createClient({
      url:
        process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_GRAPHQL_URL || FALLBACK_URL
          : FALLBACK_URL,
      requestPolicy: 'cache-and-network',
      exchanges,
    });
  }

  public getSsr(): SSRExchange {
    if (!this.ssr) {
      throw new Error('SSR exchange is not available');
    }

    return this.ssr;
  }
}
