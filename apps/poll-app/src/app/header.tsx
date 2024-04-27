'use client';

import { Button } from '@org/ui-kit/ui/button';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
} from '@org/ui-kit/ui/nav';
import { ThemeToggle } from '@org/ui-kit/ui/theme-toggle';
import Link from 'next/link';
import { useState } from 'react';

const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar shouldHideOnScroll onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent id="brand-group">
        {/* <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        /> */}
        <NavbarBrand>
          <Link href="/">
            <h1 className="text-5xl font-extralight">Pollstr</h1>
          </Link>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent justify="end" id="end-group">
        <NavbarItem>
          <Button variant="outline" asChild>
            <Link href="/login">Login</Link>
          </Button>
        </NavbarItem>
        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        <NavbarMenuItem>
          <Link href="/polls">Polls</Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
};

export default AppHeader;
