"use client";

import PACTable from "@/app/components/pac-table";
import { Button } from "@heroui/react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

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
            Manajemen data kecamatan dan anak cabang
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          startContent={<PlusCircleIcon className="w-5 h-5" />}
        >
          Tambah Kecamatan
        </Button>
      </div>

      {/* Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border-gray-700">
        <div className="p-4 sm:p-6">
          {/* Table Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Daftar Anak Cabang
            </h3>
            <div className="flex items-center gap-3 w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari kecamatan..."
                className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="border rounded-lg overflow-hidden">
            <PACTable />
          </div>
        </div>
      </div>
    </section>
  );
}