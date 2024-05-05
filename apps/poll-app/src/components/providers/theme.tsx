'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { FC, PropsWithChildren } from 'react';

const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
};

export default ThemeProvider;
