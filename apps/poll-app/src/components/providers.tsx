'use client';
import { ApolloWrapper } from '@org/graphql';
import { ThemeProvider } from 'next-themes';
import { FC, PropsWithChildren } from 'react';

const Providers: FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider attribute="class" enableColorScheme enableSystem>
    <ApolloWrapper>{children}</ApolloWrapper>
  </ThemeProvider>
);

export default Providers;
