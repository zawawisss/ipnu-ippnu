"use client";

import { Button, Navbar, Input, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { signOut, useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Cookies from "js-cookie";
import React, { useState, useEffect, useRef, Fragment } from "react";
import { Alert } from "@heroui/alert";
import { Session } from "next-auth";
import Image from "next/image";
import dayjs from "dayjs";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "admin" | "ketua" | "sekretaris";
      org?: "ipnu" | "ippnu";
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
  const [open, setOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs().format("HH:mm:ss"));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format("HH:mm:ss"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

    Object.keys(Cookies.get()).forEach((cookieName) => {
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
      const targetPath =
        org === "ipnu" ? "/admin_ipnu/dashboard" : "/admin_ippnu";
      router.push(targetPath);
      window.location.reload();
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

    if (session.user.role === "admin") {
      return session.user.org === "ipnu" ? "Admin IPNU" : "Admin IPPNU";
    } else if (session.user.role === "ketua") {
      return session.user.org === "ipnu" ? "Ketua IPNU" : "Ketua IPPNU";
    } else {
      return session.user.org === "ipnu"
        ? "Sekretaris IPNU"
        : "Sekretaris IPPNU";
    }
  };

  return (
    <Navbar className="top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-40 flex items-center px-4">
      <div className="flex-1 flex items-center gap-4">
        <Icon icon="lucide:bar-chart" className="w-6 h-6 text-primary" />
        {/* Greeting hanya tampil di desktop */}
        {session?.user?.role && (
          <span className="hidden sm:inline text-gray-700 dark:text-gray-200 font-semibold animate-fade-in">
            Selamat datang, {getDisplayName()}!
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Jam hanya di desktop */}
        <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-300 font-mono">
          {mounted ? currentTime : ""}
        </span>
        {/* Status online tetap */}
        {session?.user && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium border border-green-300">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Online
          </span>
        )}
        {/* Alert tetap */}
        {showAlert && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 p-4">
            <Alert color="danger" title="Kata sandi salah" />
          </div>
        )}
        {/* Tombol theme switch: icon saja di mobile, icon+teks di desktop */}
        {mounted && (
          <Button
            variant="flat"
            onPress={toggleTheme}
            startContent={
              <Icon icon={theme === "light" ? "lucide:moon" : "lucide:sun"} />
            }
            className="flex sm:hidden"
            aria-label="Switch Theme"
          />
        )}
        {mounted && (
          <Button
            variant="flat"
            onPress={toggleTheme}
            startContent={
              <Icon icon={theme === "light" ? "lucide:moon" : "lucide:sun"} />
            }
            className="hidden sm:flex"
          >
            {theme === "light" ? "Dark" : "Light"} Mode
          </Button>
        )}
        {/* Switch account: icon saja di mobile, menu user tetap di desktop */}
        {session?.user && (
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton
                className="inline-flex w-full justify-center items-center gap-2 rounded-md bg-primary dark:bg-gray-700 px-2 sm:px-4 py-2 text-sm font-medium text-white dark:text-gray-300 hover:bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                onClick={() => setOpen(!open)}
                aria-label="Switch Account"
              >
                <Icon
                  icon="heroicons-outline:user-circle"
                  className="sm:hidden w-6 h-6"
                />
                <span className="hidden sm:inline">{getDisplayName()}</span>
                <ChevronDownIcon
                  className="h-5 w-5 text-white dark:text-gray-300"
                  aria-hidden="true"
                />
              </MenuButton>
            </div>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <MenuItems
                static
                className="absolute right-0 mt-2 w-72 origin-top-right divide-y divide-gray-100 dark:divide-gray-600 rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center mb-4">
                    <Image
                      src={org === "ipnu" ? "/ipnu.png" : "/ippnu.png"}
                      alt={org === "ipnu" ? "IPNU Logo" : "IPPNU Logo"}
                      height={80}
                      width={80}
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex justify-center gap-2 mb-4">
                    <Button
                      variant={org === "ipnu" ? "solid" : "bordered"}
                      color="primary"
                      size="sm"
                      onPress={() => setOrg("ipnu")}
                      className="rounded-full"
                    >
                      IPNU
                    </Button>
                    <Button
                      variant={org === "ippnu" ? "solid" : "bordered"}
                      color="primary"
                      size="sm"
                      onPress={() => setOrg("ippnu")}
                      className="rounded-full"
                    >
                      IPPNU
                    </Button>
                  </div>
                </div>

                <div className="p-4" onClick={(e) => e.stopPropagation()}>
                  <Select
                    label="Peran"
                    labelPlacement="outside"
                    className="w-full"
                    selectedKeys={[role]}
                    onChange={(e) =>
                      setRole(
                        e.target.value as "admin" | "ketua" | "sekretaris"
                      )
                    }
                  >
                    <SelectItem key="admin">Admin</SelectItem>
                    <SelectItem key="ketua">Ketua</SelectItem>
                    <SelectItem key="sekretaris">Sekretaris</SelectItem>
                  </Select>
                </div>

                <div className="p-4" onClick={(e) => e.stopPropagation()}>
                  <Input
                    type="password"
                    label="Kata Sandi"
                    labelPlacement="outside"
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSwitchAccount();
                      }
                    }}
                  />
                </div>

                <div
                  className="p-4 flex justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => {
                      signOut({ callbackUrl: "/login" });
                    }}
                    startContent={<Icon icon="heroicons-outline:logout" />}
                    className="flex-1"
                  >
                    Keluar
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSwitchAccount}
                    startContent={<Icon icon="heroicons-outline:arrow-right" />}
                    className="flex-1"
                  >
                    Masuk
                  </Button>
                </div>
              </MenuItems>
            </Transition>
          </Menu>
        )}
      </div>
    </Navbar>
  );
}
