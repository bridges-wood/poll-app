'use client';

import { ThemeToggle } from '@org/ui-kit/ui/theme-toggle';
import Link from 'next/link';

const AppHeader = () => {
  return (
    <header className="w-full flex justify-between items-center h-20 px-4">
      <Link href="/">
        <h1 className="text-5xl font-extralight">Pollstr</h1>
      </Link>
      <ThemeToggle />
    </header>
  );
};

export default AppHeader;
