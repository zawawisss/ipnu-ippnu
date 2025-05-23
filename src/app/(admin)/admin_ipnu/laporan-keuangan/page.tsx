import KeuanganForm from "@/app/components/admin/keuangan-form";
import React from "react";

export default function LaporanKeuanganPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Laporan Keuangan</h1>
      <p>Halaman laporan keuangan IPNU. Silakan tambahkan konten sesuai kebutuhan.</p>
      <KeuanganForm />
    </div>
  );
}
