// components/Sidebar.tsx
"use client";

import { useState } from "react";
import { Button } from "@heroui/react"; // Hanya impor Button jika Navbar tidak dipakai lagi
import {
  ChartBarSquareIcon,
  MapPinIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArchiveBoxIcon,
  DocumentIcon, // Added DocumentIcon for the Surat menu
  BanknotesIcon, // Tambahkan icon BanknotesIcon untuk laporan keuangan
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BellIcon, CalendarDaysIcon } from "lucide-react";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null
  );

  // Determine the display role
  const displayRole = session?.user?.role
    ? session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)
    : "Guest";
  const displayOrg = session?.user?.name?.includes("ippnu") ? "IPPNU" : "IPNU";
  const displayUser = session?.user?.name
    ? `${displayOrg} ${displayRole}`
    : "Loading...";

  const handleDropdownToggle = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Gabungkan menu wilayah
  const wilayahDropdown = {
    name: "Wilayah",
    icon: MapPinIcon,
    children: [
      { name: "Kecamatan", href: "/admin_ipnu/kecamatan", icon: MapPinIcon },
      { name: "Desa", href: "/admin_ipnu/desa", icon: MapPinIcon },
      { name: "Komisariat", href: "/admin_ipnu/komisariat", icon: AcademicCapIcon },
      { name: "Anggota", href: "/admin/anggota", icon: UserGroupIcon },
      
    ],
  };
  const arsipDropdown = {
    name: "Arsip Surat",
    icon: ArchiveBoxIcon,
    children: [
      {
        name: "Surat Masuk",
        href: "/admin_ipnu/surat/arsip/masuk",
        icon: ArrowLeftOnRectangleIcon,
      },
      {
        name: "Surat Keluar",
        href: "/admin_ipnu/surat/arsip/keluar",
        icon: ArrowLeftOnRectangleIcon,
      },
    ],
  };
  const suratDropdown = {
    name: "Surat",
    icon: DocumentIcon,
    children: [
      {
        name: "Buat Surat",
        href: "/admin_ipnu/surat/tambah",
        icon: ChartBarSquareIcon,
      },
      {
        name: "Surat Menunggu Persetujuan",
        href: "/admin_ipnu/surat/persetujuan/approval",
        icon: ChartBarSquareIcon,
      },
      {
        name: "Surat Disetujui",
        href: "/admin_ipnu/surat/persetujuan/approved",
        icon: ChartBarSquareIcon,
      },
    ],
  };

  const laporanKeuanganItem = {
    name: "Laporan Keuangan",
    href: "/admin_ipnu/laporan-keuangan",
    icon: BanknotesIcon,
  };
const kalender={
  name: "Kalender",
  href: "/admin_ipnu/kalender",
  icon: CalendarDaysIcon,
}
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin_ipnu/dashboard",
      icon: ChartBarSquareIcon,
    },
    wilayahDropdown,
    arsipDropdown,
    suratDropdown,
    laporanKeuanganItem,
    kalender,
    // Tambahkan menu laporan keuangan di akhir navItems
  ];

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden sm:flex sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 flex-col transition-width duration-300">
        <div className="flex flex-col items-center py-6 border-b border-gray-200 dark:border-gray-700">
          <Image
            src={displayOrg === "IPPNU" ? "/ippnu.png" : "/ipnu.png"}
            alt={displayOrg}
            width={56}
            height={56}
            className="rounded-full mb-2 shadow-md"
          />
          <span className="text-base font-bold text-primary-600 dark:text-primary-400">
            {session?.user?.name || "User"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-300">
            {displayUser}
          </span>
        </div>
        <div className="flex-1 px-2 py-4 space-y-1">
          {/* Menu navigasi */}
          {navItems.map((item) => {
            if ("children" in item) {
              // Render parent item with children as a dropdown
              const isOpen = openDropdown === item.name;
              return (
                <div key={item.name}>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : item.name)}
                    className="flex items-center justify-between w-full gap-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && (
                        <item.icon className="w-6 h-6 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="ml-4 space-y-1">
                      {item.children.map((child: any) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {child.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary-100 dark:bg-gray-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.icon && (
                    <item.icon
                      className={`w-6 h-6 flex-shrink-0 ${
                        isActive
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-primary-700 dark:text-white"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            }
          })}
        </div>
        <div className="mt-auto py-3 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700">
          &copy; {new Date().getFullYear()} IPNU/IPPNU Kab. Cirebon
        </div>
      </aside>
      {/* Bottom nav mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-14">
        {navItems.map((item) => {
          if ("children" in item) {
            const isOpen = openMobileDropdown === item.name;
            return (
              <div
                key={item.name}
                className="relative flex-1 flex flex-col items-center"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenMobileDropdown(isOpen ? null : item.name)
                  }
                  className={`flex flex-col items-center justify-center w-full py-1 ${
                    isOpen
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-500 dark:text-gray-300"
                  }`}
                >
                  {item.icon && <item.icon className="w-6 h-6 mb-0.5" />}
                  <span className="text-xs leading-none">{item.name}</span>
                  <ChevronUpIcon
                    className={`w-4 h-4 mx-auto mt-0.5 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 min-w-max bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {item.children.map((child: any) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setOpenMobileDropdown(null)}
                      >
                        {child.icon && <child.icon className="w-5 h-5" />}
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          } else {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href!}
                className={`flex flex-col items-center justify-center flex-1 py-1 ${
                  isActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-500 dark:text-gray-300"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon && <item.icon className="w-6 h-6 mb-0.5" />}
                <span className="text-xs leading-none">{item.name}</span>
              </Link>
            );
          }
        })}
      </nav>
    </>
  );
}
