// components/Navbar
'use client'
import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useEffect } from "react";
import { useTheme } from "next-themes";


function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false); //
  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Statistik PAC", href: "#" },
    { name: "Tentang Kami", href: "#" },
  ];
  const [isMounted, setIsMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  if (!isMounted) return null;
  return (
    <Navbar
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="px-4 sm:px-6"
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <Icon icon="lucide:bar-chart" className="w-6 h-6 text-primary" />
          <p className="font-bold text-inherit ml-2">PC IPNU-IPPNU</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex" justify="start">
        <NavbarBrand>
          <Icon icon="lucide:bar-chart" className="w-6 h-6 text-primary" />
          <p className="font-bold text-inherit ml-2">PC IPNU-IPPNU Ponorogo</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4">
          {menuItems.map((item, index) => (
            <NavbarItem key={`${item.name}-${index}`}>
              <Link
                color="foreground"
                href={item.href}
                className={index === 0 ? "active-link" : ""}
              >
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
      </NavbarContent>

      <NavbarContent justify="end">
      <NavbarItem>
            <Button
              variant="flat"
              onPress={toggleTheme}
              isIconOnly
              className="sm:hidden"
            >
              <Icon icon={theme === 'light' ? 'lucide:moon' : 'lucide:sun'} className="w-5 h-5" />
            </Button>
            <Button
              variant="flat"
              onPress={toggleTheme}
              startContent={<Icon icon={theme === 'light' ? 'lucide:moon' : 'lucide:sun'} />}
              className="hidden sm:flex"
            >
              {theme === 'light' ? 'Dark' : 'Light'} Mode
            </Button>
          </NavbarItem>
        <NavbarItem>
          <Button
            color="primary"
            variant="solid"
            as={Link}
            href="/login"
            isIconOnly
            className="sm:hidden"
          >
            <Icon icon="lucide:user" className="w-5 h-5" />
          </Button>
          <Button
            color="primary"
            variant="solid"
            as={Link}
            href='/login'
            startContent={<Icon icon="lucide:user" />}
            className="hidden sm:flex"
          >
            Admin Login
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              color={index === 0 ? "primary" : "foreground"}
              className="w-full"
              href={item.href}
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}

export default AppNavbar;
