"use client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/nextauth";
import Link from "next/link";
import { redirect } from "next/navigation";
import PACTable from "@/app/components/pac-table";
import { Divider } from "@heroui/react";

function AdminIPNUPage() {
  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>

        {/* Statistik Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            Total Kecamatan
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            Total Desa
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            Total Komisariat
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            Total Anggota
          </div>
        </div>
        <Divider className="my-6 sm:my-8" />
      </main>
    </div>
  );
}
export default AdminIPNUPage;
