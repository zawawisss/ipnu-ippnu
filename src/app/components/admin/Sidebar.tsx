// components/Sidebar.tsx
"use client";

import { Button } from "@heroui/react"; // Hanya impor Button jika Navbar tidak dipakai lagi
import {
  ChartBarSquareIcon,
  MapPinIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = session?.user?.name?.includes("IPPNU") ? "IPPNU" : "IPNU";

  const navItems = [
    { name: "Dashboard", href: "/admin_ipnu/dashboard", icon: ChartBarSquareIcon },
    { name: "Kecamatan", href: "/admin_ipnu/kecamatan", icon: MapPinIcon },
    { name: "Desa", href: "/admin/desa", icon: MapPinIcon },
    { name: "Komisariat", href: "/admin/komisariat", icon: AcademicCapIcon },
    { name: "Anggota", href: "/admin/anggota", icon: UserGroupIcon },
  ];

  return (
    <aside className="sticky top-0 left-0 h-screen w-full sm:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col transition-width duration-300">
      <div>
        {/* Header */}
        <div className="hidden sm:flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 truncate">
            {userRole} Admin
          </h1>
        </div>

        {/* GANTI BAGIAN INI: Gunakan <nav> dan <div> biasa, bukan <Navbar> */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ name, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={name}
                href={href}
                className={`flex items-center justify-center sm:justify-start gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-100 dark:bg-gray-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-6 h-6 flex-shrink-0 ${ // Tambahkan flex-shrink-0 untuk mencegah ikon mengecil
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                />
                <span
                  className={`hidden sm:inline text-sm font-medium ${
                    isActive
                      ? 'text-primary-700 dark:text-white'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {name}
                </span>
              </Link>
            );
          })}
        </nav>
        {/* AKHIR BAGIAN YANG DIGANTI */}

      </div>
      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        {/* ... (sisa kode footer sama) ... */}
        <div className="hidden sm:block mb-2 text-sm text-gray-500 dark:text-gray-400">
            <p>Login sebagai:</p>
            <p className="font-medium text-gray-700 dark:text-gray-300 truncate">{userRole}</p>
        </div>
        <Button
            variant="ghost"
            size="sm"
            onPress={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center sm:justify-start gap-2"
        >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </aside>
  );
}