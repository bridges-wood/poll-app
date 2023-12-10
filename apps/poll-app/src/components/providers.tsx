'use client';
import { ApolloWrapper } from '@org/graphql';
import { AuthContextProvider } from '@poll-app/lib/context/AuthContext';
import { ThemeProvider } from 'next-themes';
import { FC, PropsWithChildren } from 'react';

const Providers: FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider attribute="class" enableColorScheme enableSystem>
    <AuthContextProvider>
      <ApolloWrapper>{children}</ApolloWrapper>
    </AuthContextProvider>
  </ThemeProvider>
);

export default Providers;
