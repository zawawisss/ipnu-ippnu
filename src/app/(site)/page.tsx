// /app/page.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Divider } from "@heroui/react";
import StatisticsCard from '../components/statistik';
import PACTable from '../components/pac-table';


interface SpData {
  kecamatan: string;
  tanggal_berakhir: string;
}

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

  const [expiredSp, setExpiredSp] = useState<string[]>([]);
  const [expiringSp, setExpiringSp] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => { // Tambahkan async
      try {
        const response = await fetch("/api/total");
        if (!response.ok) {
          throw new Error(`Failed to fetch total data: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching total data:", error);
        // Atur state error jika perlu
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => { // Tambahkan async
        setLoading(true);
        try {
          const response = await fetch("/api/sp-status");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const spData: SpData[] = await response.json();

          const today = new Date();
          const expired: string[] = [];
          const expiring: string[] = [];

          if (Array.isArray(spData)) {
            spData.forEach((sp: SpData) => {
              const endDate = new Date(sp.tanggal_berakhir);
              const diffInDays = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

              if (diffInDays < 0) {
                expired.push(sp.kecamatan);
              } else if (diffInDays <= 14) {
                expiring.push(sp.kecamatan);
              }
            });
          } else {
            console.error("Unexpected data structure from /api/sp-status", spData);
            setExpiredSp([]);
            setExpiringSp([]);
          }

          setExpiredSp(expired);
          setExpiringSp(expiring);
        } catch (error) {
          console.error("Error fetching SP status:", error);
          setExpiredSp([]);
          setExpiringSp([]);
        } finally {
          setLoading(false);
        }
    };
    fetchData();
  }, []);

  const marqueeText = useMemo(() => {
    let text = "";
    if (loading) {
      return "Loading SP Data...";
    } else if (expiredSp.length > 0 || expiringSp.length > 0) {
      if (expiredSp.length > 0) {
        text += `Kecamatan Expired: ${expiredSp.join(", ")} | `;
      }
      if (expiringSp.length > 0) {
        text += `Kecamatan Expiring: ${expiringSp.join(", ")}`;
      }
      return text;
    }
    return "No SP data available.";
  }, [expiredSp, expiringSp, loading]);

  const classNames = (...classes: (string | undefined | { [key: string]: boolean })[]): string => {
    let result = '';
    classes.forEach(c => {
      if (c) {
        if (typeof c === 'string') {
          result += c + ' ';
        } else if (typeof c === 'object') {
          for (const key in c) {
            if (c[key]) {
              result += key + ' ';
            }
          }
        }
      }
    });
    return result.trim();
  };

  return (
    <div className="top-20 min-h-screen bg-background flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-grow">
        {marqueeText && (
          <div className="w-full overflow-hidden mb-8">
            <div className="animate-marquee whitespace-nowrap py-2 text-gray-700 dark:text-gray-300">
              {marqueeText}
            </div>
          </div>
        )}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">
            Statistik PC IPNU-IPPNU Ponorogo
          </h2>
          <div className={classNames(
            "grid",
            "grid-cols-2",
            "sm:grid-cols-3",
            "lg:grid-cols-4",
            "gap-3",
            "sm:gap-4"
          )}>
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
          <div className="lg:col-span-full">
            <h3 className="text-lg sm:text-xl font-bold mb-4">
              DAFTAR ANAK CABANG
            </h3>
            <PACTable />
          </div>
        </div>
      </main>
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite; /* Durasi dan kecepatan bisa disesuaikan */
        }
      `}</style>
    </div>
  );
}

export default Dashboard;

