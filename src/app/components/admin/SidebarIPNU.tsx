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
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin_ipnu/dashboard",
      icon: ChartBarSquareIcon,
    },
    { name: "Kecamatan", href: "/admin_ipnu/kecamatan", icon: MapPinIcon },
    { name: "Desa", href: "/admin/desa", icon: MapPinIcon },
    { name: "Komisariat", href: "/admin/komisariat", icon: AcademicCapIcon },
    { name: "Anggota", href: "/admin/anggota", icon: UserGroupIcon },
    {
      name: "Arsip Surat", // Separate Arsip Surat menu
      icon: ArchiveBoxIcon,
      children: [
        { name: "Surat Masuk", href: "/admin_ipnu/surat/arsip/masuk", icon: ArrowLeftOnRectangleIcon },
        { name: "Surat Keluar", href: "/admin_ipnu/surat/arsip/keluar", icon: ArrowLeftOnRectangleIcon },
      ],
    },
    {
      name: "Surat", // Separate Surat menu
      icon: DocumentIcon, // Using DocumentIcon for the Surat menu
      children: [
        { name: "Buat Surat", href: "/admin_ipnu/surat/buat", icon: ChartBarSquareIcon },
        { name: "Surat Menunggu Persetujuan", href: "/admin_ipnu/surat/persetujuan/approval", icon: ChartBarSquareIcon },
        { name: "Surat Disetujui", href: "/admin_ipnu/surat/persetujuan/approved", icon: ChartBarSquareIcon },
      ],
    },
  ];

  return (
    <aside className="sticky top-0 left-0 h-screen w-full sm:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col transition-width duration-300">
      <div>
        {/* Header */}
        {/* Header */}
        <div className="hidden sm:flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 truncate">
            {displayUser}
          </h1>
        </div>

        {/* GANTI BAGIAN INI: Gunakan <nav> dan <div> biasa, bukan <Navbar> */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            if (item.children) {
              // Render parent item with children as a dropdown
              const isOpen = openDropdown === item.name;
              return (
                <div key={item.name}>
                  <button
                    type="button"
                    onClick={() => handleDropdownToggle(item.name)}
                    className="flex items-center justify-between w-full gap-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <item.icon className="w-6 h-6 flex-shrink-0" />}
                      <span className="hidden sm:inline text-sm font-medium">{item.name}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUpIcon className="w-5 h-5 hidden sm:block" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 hidden sm:block" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="ml-4 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`flex items-center justify-center sm:justify-start gap-3 px-3 py-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700`}
                        >
                          <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200">
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
                  className={`flex items-center justify-center sm:justify-start gap-3 px-3 py-2 rounded-md transition-colors ${
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
                    className={`hidden sm:inline text-sm font-medium ${
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
        </nav>
        {/* AKHIR BAGIAN YANG DIGANTI */}
      </div>
      {/* Footer */}

    </aside>
  );
}
