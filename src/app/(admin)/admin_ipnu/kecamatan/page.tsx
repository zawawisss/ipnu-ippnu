"use client";

import { Button } from "@heroui/react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import PACTableAdmin from "@/app/components/admin/pacDataAdmin";

export default function AdminContent() {
  return (
    <section className="p-6 sm:p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Kelola Kecamatan
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manajemen data anak cabang
          </p>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border-gray-700">
          {/* Table Container */}
          <div className="rounded-lg overflow-hidden">
            <PACTableAdmin />
          </div>
        </div>
    </section>
  );
}