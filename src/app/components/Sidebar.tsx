// components/Sidebar.tsx
"use client";

import { Button } from "@heroui/react";
import {
  LayoutDashboard,
  MapPin,
  School,
  Users,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function Sidebar() {
  const { data: session } = useSession();
  const userRole = session?.user?.name?.includes("IPPNU") ? "IPPNU" : "IPNU";
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin_ipnu/dashboard", icon: LayoutDashboard },
    { name: "Kecamatan", href: "/admin_ipnu/kecamatan", icon: MapPin },
    { name: "Desa", href: "/admin/desa", icon: MapPin },
    { name: "Komisariat", href: "/admin/komisariat", icon: School },
    { name: "Anggota", href: "/admin/anggota", icon: Users },
  ];

  return (
    <aside className="h-screen bg-base-200 border-r w-64 flex flex-col justify-between transition-all duration-300">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h1 className="text-xl font-bold text-primary">
            {collapsed ? "IP" : `${userRole} Admin`}
          </h1>
          <button onClick={() => setCollapsed(!collapsed)} className="btn btn-sm btn-ghost">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Menu */}
        <ul className="menu px-2">
          {navItems.map(({ name, href, icon: Icon }) => (
            <li key={name}>
              <Link href={href} className="flex gap-3 items-center">
                <Icon size={20} />
                {!collapsed && name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Section */}
      <div className="px-4 py-4 border-t flex flex-col gap-3">
        {!collapsed && (
          <p className="text-sm text-gray-500">Login sebagai: <span className="font-semibold">{userRole}</span></p>
        )}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onPress={toggleTheme}>
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <Button
            onPress={() => signOut({ callbackUrl: "/login" })}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white w-full"
          >
            {!collapsed ? "Logout" : <LogOut size={18} />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
