'use client';

import { ClientFactory } from '@poll-app/lib/api/client-factory';
import { UrqlProvider } from '@urql/next';
import { ThemeProvider } from 'next-themes';
import { FC, PropsWithChildren, useMemo } from 'react';

const Providers: FC<PropsWithChildren> = ({ children }) => {
  const [client, ssr] = useMemo(() => {
    const clientFactory = new ClientFactory({ isClientSide: true });
    const client = clientFactory.getClient();
    const ssr = clientFactory.getSsr();

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
