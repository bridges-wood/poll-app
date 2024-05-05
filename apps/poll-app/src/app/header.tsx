'use client';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@org/ui-kit/ui/nav';
import { ThemeToggle } from '@org/ui-kit/ui/theme-toggle';
import AuthButton from '@poll-app/components/buttons/auth-button/auth-button';
import Link from 'next/link';
import { useState } from 'react';

const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar
      shouldHideOnScroll
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      maxWidth="xl"
    >
      <NavbarContent id="brand-group">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link href="/">
            <h1 className="text-5xl font-extralight">Pollstr</h1>
          </Link>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent
        id="center-group"
        justify="center"
        className="hidden sm:flex"
      >
        <NavbarItem>
          <Link href="/home">Home</Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end" id="end-group">
        <NavbarItem className="xs:list-item hidden h-9">
          <AuthButton />
        </NavbarItem>
        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        <NavbarMenuItem>
          <Link
            href="/home"
            onClick={() => {
              setIsMenuOpen(false);
            }}
          >
            Home
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem className="max-xs:hidden">
          <Link href="/login" onClick={() => setIsMenuOpen(false)}>
            Login
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
};

export default AppHeader;
