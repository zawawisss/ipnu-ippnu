"use client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/nextauth";
import Link from "next/link";
import { redirect } from "next/navigation";
import PACTable from "@/app/components/pac-table";
import { Divider } from "@heroui/react";
import StatisticsCard from "@/app/components/statistik"; // Import StatisticsCard

function AdminIPNUPage() {
  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>

        {/* Statistik Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatisticsCard
            title="Total Kecamatan"
            value={0} // Placeholder value
            icon="mdi:city" // Placeholder icon
            color="primary"
            href="/admin_ipnu/kecamatan" // Link to kecamatan page
          />
          <StatisticsCard
            title="Total Desa"
            value={0} // Placeholder value
            icon="mdi:home-city" // Placeholder icon
            color="success"
            href="/admin_ipnu/desa" // Link to desa page (needs to be created)
          />
          <StatisticsCard
            title="Total Komisariat"
            value={0} // Placeholder value
            icon="mdi:school" // Placeholder icon
            color="warning"
            href="/admin_ipnu/sekolah" // Link to sekolah page (needs to be created)
          />
          <StatisticsCard
            title="Total Anggota"
            value={0} // Placeholder value
            icon="mdi:account-group" // Placeholder icon
            color="primary"
            href="/admin_ipnu/anggota" // Link to anggota page (needs to be created)
          />
        </div>
        <Divider className="my-6 sm:my-8" />
      </main>
    </div>
  );
}
export default AdminIPNUPage;
