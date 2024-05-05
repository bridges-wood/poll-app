'use client';

import { FC, PropsWithChildren } from 'react';
import GraphQLProvider from './graphql';
import StoreProvider from './store';
import ThemeProvider from './theme';

const Providers: FC<PropsWithChildren> = ({ children }) => {
  // Wrap the children with the providers, left-most outer-most
  return [GraphQLProvider, ThemeProvider, StoreProvider].reduceRight(
    (acc, Provider) => {
      return <Provider>{acc}</Provider>;
    },
    children,
  );
};

export default Providers;
