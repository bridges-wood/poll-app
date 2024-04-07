'use client';
import { ApolloWrapper } from '@org/graphql';
import { AuthContextProvider } from '@poll-app/lib/context/AuthContext';
import { ThemeProvider } from 'next-themes';
import { FC, PropsWithChildren } from 'react';

const Providers: FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider attribute="class" enableColorScheme forcedTheme="dark">
    <ApolloWrapper>
      <AuthContextProvider>{children}</AuthContextProvider>
    </ApolloWrapper>
  </ThemeProvider>
);

export default Providers;
