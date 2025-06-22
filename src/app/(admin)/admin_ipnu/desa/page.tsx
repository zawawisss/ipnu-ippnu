"use client";

import PRDataAdmin from "@/app/components/admin/prDataAdmin";
export default function AdminDesaContent() {
  return (
    <section className="p-6 sm:p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Kelola Desa
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manajemen data desa/ranting
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border-gray-700">
        <div className="rounded-lg overflow-hidden">
        <PRDataAdmin />
        </div>
      </div>
    </section>
  );
}
