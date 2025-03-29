"use client";

import PACTable from "@/app/components/pac-table";
import { Button } from "@heroui/react";

export default function AdminContent() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kelola Kecamatan</h1>
      <Button className="mb-4">+ Tambah Kecamatan</Button>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="lg:col-span-full overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-4">DAFTAR ANAK CABANG</h3>
            <PACTable />
          </div>
        </div>
      </div>
    </div>
  );
}
