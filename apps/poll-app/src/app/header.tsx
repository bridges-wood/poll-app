'use client';

import { ClientOnly } from '@org/ui-kit/ui/client-only';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@org/ui-kit/ui/navigation-menu';
import { Skeleton } from '@org/ui-kit/ui/skeleton';
import { ThemeToggle } from '@org/ui-kit/ui/theme-toggle';
import AuthButton from '@poll-app/components/buttons/auth-button/auth-button';
import useIsLoggedIn from '@poll-app/lib/hooks/use-is-logged-in';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

const AppHeader = () => {
  const isLoggedIn = useIsLoggedIn();

  return (
    <NavigationMenu className="w-full max-w-none p-4 [&>div:nth-child(2)]:left-auto [&>div:nth-child(2)]:right-8 [&>div:nth-child(2)]:top-16">
      <NavigationMenuList className="w-[calc(100vw-2rem)] max-w-7xl justify-between">
        <NavigationMenuItem className="flex-grow basis-0">
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink
              className={twMerge(navigationMenuTriggerStyle(), 'h-auto')}
            >
              <h1 className="text-5xl font-extralight">Pollstr</h1>
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem id="center-group" className="hidden sm:flex">
          <Link href="/home" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem
          id="end-group"
          className="flex flex-grow basis-0 items-center justify-end gap-2"
        >
          <div className="h-9 max-sm:hidden">
            <AuthButton />
          </div>
          <ClientOnly skeleton={<Skeleton className="h-9 w-9" />}>
            <ThemeToggle className="max-sm:hidden" />
          </ClientOnly>
        </NavigationMenuItem>
        <NavigationMenuItem className="flex sm:hidden">
          <NavigationMenuTrigger>
            <HamburgerMenuIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex max-w-80 flex-col text-right">
              {isLoggedIn && (
                <Link href="/home" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Home
                  </NavigationMenuLink>
                </Link>
              )}
              <Link href="/login" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Login
                </NavigationMenuLink>
              </Link>
              <Link href="/sign-up" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Sign Up
                </NavigationMenuLink>
              </Link>
              <li className="bg-border -mx-1 my-1 h-px" />
              <li className="grid place-items-center px-4 pb-2">
                <ClientOnly skeleton={<Skeleton className="h-9 w-9" />}>
                  <ThemeToggle
                    triggerProps={{
                      variant: 'ghost',
                    }}
                  />
                </ClientOnly>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default AppHeader;
