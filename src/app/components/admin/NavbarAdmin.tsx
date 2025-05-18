"use client";

import { Button, Navbar, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { signOut, useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Cookies from "js-cookie";
import React, { useState, useEffect, useRef } from "react";
import { Alert } from "@heroui/alert";
import { Session } from "next-auth";
import Image from "next/image";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "admin" | "ketua" | "sekretaris";
    };
  }
}
export default function NavbarAdmin() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [org, setOrg] = useState<"ipnu" | "ippnu">("ipnu");
  const [role, setRole] = useState<"admin" | "ketua" | "sekretaris">("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (error) {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setError(false);
      }, 3000);
    }
  }, [error]);

  const handleSwitchAccount = async () => {
    setError(false);
  
    if (!password) {
      setError(true);
      return;
    }
  
    // Remove all cookies before logging in
    Object.keys(Cookies.get()).forEach(function (cookieName) {
      Cookies.remove(cookieName);
    });
  
    const username = `${org}_${role}`;
  
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
  
    if (res?.error) {
      setError(true);
    } else if (res?.ok) {
      const targetPath = org === "ipnu" ? "/admin_ipnu/dashboard" : "/admin_ippnu";
      router.push(targetPath);
      window.location.reload(); // Force reload to update session role
    }
  };
  

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: session } = useSession();

  const getDisplayName = () => {
    if (!session?.user) return "";

    let displayName = "";
    if (session.user.role === "admin") {
      displayName = org === "ipnu" ? "Admin IPNU" : "Admin IPPNU";
    } else if (session.user.role === "ketua") {
      displayName = org === "ipnu" ? "Ketua IPNU" : "Ketua IPPNU";
    } else {
      displayName = org === "ipnu" ? "Sekretaris IPNU" : "Sekretaris IPPNU";
    }
    return displayName;
  };

  return (
    <Navbar className="top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-40 flex items-center px-4">
      <div className="flex-1 flex items-center">
        <Icon icon="lucide:bar-chart" className="w-6 h-6 text-primary" />
      </div>
      <div className="flex items-center gap-4">
        {showAlert && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 p-4">
            <Alert color="danger" title="Kata sandi salah" />
          </div>
        )}
        {mounted && (
          <Button
            variant="flat"
            onPress={toggleTheme}
            startContent={
              <Icon icon={theme === "light" ? "lucide:moon" : "lucide:sun"} />
            }
          >
            {theme === "light" ? "Dark" : "Light"} Mode
          </Button>
        )}

        {session?.user ? (
          <Menu
            as="div"
            className="relative inline-block text-left"
            ref={menuRef}
          >
            <div>
              <MenuButton
                className="inline-flex w-full justify-center items-center rounded-md bg-primary dark:bg-gray-700 px-4 py-2 text-sm font-medium text-white dark:text-gray-300 hover:bg-opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                onClick={() => setOpen(!open)}
              >
                {getDisplayName()}
                <ChevronDownIcon
                  className="ml-2 -mr-1 h-5 w-5 text-white dark:text-gray-300"
                  aria-hidden="true"
                />
              </MenuButton>
            </div>
            <MenuItems className="absolute right-0 mt-2 w-72 origin-top-right rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-6 px-4">
                <div className="mb-8 flex justify-center">
                  <Image
                    src={org === "ipnu" ? "/ipnu.png" : "/ippnu.png"}
                    alt={org === "ipnu" ? "IPNU Logo" : "IPPNU Logo"}
                    height={96}
                    width={96}
                  />
                </div>
                <div className="my-4 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex justify-center gap-4 mb-2">
                  <Button
                    type="button"
                    variant={org === "ipnu" ? "solid" : "bordered"}
                    color="success"
                    className="rounded-full px-4 py-2 shadow-md"
                    onPress={() => setOrg("ipnu")}
                  >
                    IPNU
                  </Button>
                  <Button
                    type="button"
                    variant={org === "ippnu" ? "solid" : "bordered"}
                    color="success"
                    className="rounded-full px-4 py-2 shadow-md"
                    onPress={() => setOrg("ippnu")}
                  >
                    IPPNU
                  </Button>
                </div>
              </div>

              <div className="mb-4 px-4">
                <select
                  className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                  value={role}
                  onChange={(e) => {
                    e.stopPropagation();
                    setRole(e.target.value as "admin" | "ketua" | "sekretaris");
                    setOpen(false);
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="ketua">Ketua</option>
                  <option value="sekretaris">Sekretaris</option>
                </select>
              </div>

              <div className="py-3 px-4">
                <Input
                  type="password"
                  placeholder="Kata Sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 rounded-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSwitchAccount();
                    }
                  }}
                />
              </div>
              <div className="flex py-5 gap-2 px-4 justify-center">
                <MenuItem>
                  {({ active }) => (
                    <Button
                      onPress={handleSwitchAccount}
                      className="rounded-md w-20"
                      size="sm"
                      color="success"
                    >
                      <Icon
                        icon="heroicons-outline:arrow-right"
                        className="h-5 w-5 text-white dark:text-white"
                        aria-hidden="true"
                      />
                    </Button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <Button
                      color="danger"
                      onPress={() => {
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="rounded-md w-20"
                      size="sm"
                    >
                      <Icon
                        icon="heroicons-outline:logout"
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </Button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        ) : null}
      </div>
    </Navbar>
  );
}
