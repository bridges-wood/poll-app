'use client';

import { DesktopIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <AnimatePresence>
            {theme === 'light' && (
              <motion.div
                key="light"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <SunIcon className="h-[1.2rem] w-[1.2rem]" />
              </motion.div>
            )}
            {theme === 'dark' && (
              <motion.div
                key="dark"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
              </motion.div>
            )}
            {theme === 'system' && (
              <motion.div
                key="system"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <DesktopIcon className="h-[1.2rem] w-[1.2rem]" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value)}
        >
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
