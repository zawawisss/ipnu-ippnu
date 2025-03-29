// /app/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import StatisticsCard from "./components/statistik";
import PACTable from "./components/pac-table";
import { Divider } from "@heroui/react";

function Dashboard() {
  const [data, setData] = useState<{
    totalKecamatan: number;
    totalDesa: number;
    totalSekolahMaarif: number;
    totalAnggota: number;
  }>({
    totalKecamatan: 0,
    totalDesa: 0,
    totalSekolahMaarif: 0,
    totalAnggota: 0,
  });

  useEffect(() => {
    fetch("/api/total")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Statistik PC IPNU-IPPNU Ponorogo</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatisticsCard
              title={"Anak Cabang"}
              value={data.totalKecamatan}
              icon={"lucide:building"}
              color={"primary"}
            />
            <StatisticsCard
              title={"Ranting"}
              value={data.totalDesa}
              icon={"lucide:git-branch"}
              color={"success"}
            />
            <StatisticsCard
              title={"Sekolah Ma'arif"}
              value={data.totalSekolahMaarif}
              icon={"lucide:school"}
              color={"warning"}
            />
            <StatisticsCard
              title={"Anggota"}
              value={data.totalAnggota}
              icon={"lucide:user-plus"}
              color={"primary"}
            />
          </div>
        </div>
        <Divider className="my-6 sm:my-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="lg:col-span-full overflow-y-auto">
              <h3 className="text-lg sm:text-xl font-bold mb-4">DAFTAR ANAK CABANG</h3>
              <PACTable />
          </div>
        </div>
        </main>
    </div>
  );
}

export default Dashboard;
