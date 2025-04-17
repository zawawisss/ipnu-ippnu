// components/NavbarAdmin.tsx
"use client";

import { Button, Navbar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";

export default function NavbarAdmin() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <Navbar className="top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-40 flex items-center px-4">
      <div className="flex-1 flex items-center">
        <Icon icon="lucide:bar-chart" className="w-6 h-6 text-primary" />
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="flat"
          onPress={toggleTheme}
          startContent={
            <Icon icon={theme === "light" ? "lucide:moon" : "lucide:sun"} />
          }
        >
          {theme === "light" ? "Dark" : "Light"} Mode
        </Button>
      </div>
    </Navbar>
  );
}
