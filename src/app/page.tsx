"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import StatisticsCard from "./components/statistik";

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
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/total")
      .then((res) => res.json())
      .then((data) => setData(data));

    fetch("/api/kecamatanList")
      .then((res) => res.json())
      .then((data) => setKecamatanList(data));
  }, []);

  return (
    
    <div className="min-h-screen bg-background flex flex-col">
    <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Statistik PC IPNU-IPPNU Ponorogo</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatisticsCard title={"Anak Cabang"} value={data.totalKecamatan} icon={"lucide:building"} color={"primary"} />
        <StatisticsCard title={"Ranting"} value={data.totalDesa} icon={"lucide:git-branch"} color={"success"} />
        <StatisticsCard title={"Sekolah Ma'arif"} value={data.totalSekolahMaarif} icon={"lucide:school"} color={"warning"} />
        <StatisticsCard title={"Anggota"} value={data.totalAnggota} icon={"lucide:user-plus"} color={"primary"} />
        </div>
        </div>
      </main>
        <h2>List Kecamatan</h2>
        <table>
            <thead>
            <tr>
                <th>#</th>
                <th>Kecamatan</th>
                <th>Status SP</th>
                <th>Tanggal Berakhir</th>
                <th>Nomor SP</th>
                <th>Jumlah Anggota</th>
                <th>Jumlah Desa</th>
                <th>Jumlah Komisariat</th>
                <th>Jumlah Ranting</th>
            </tr>
            </thead>
            <tbody>
                {kecamatanList.map((kec, i)=>(
                    <tr key={kec._id}>
                        <td> {i+1} </td>
                        <td> {kec.kecamatan} </td>
                        <td> {kec.status_sp} </td>
                        <td> {kec.tanggal_berakhir ? new Date(kec.tanggal_berakhir).toLocaleDateString('id-ID',{
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        }): '-'} </td>
                        <td> {kec.nomor_sp} </td>
                        <td> {kec.jumlah_anggota} </td>
                        <td> {kec.jumlah_desa} </td>
                        <td> {kec.jumlah_komisariat} </td>
                        <td> {kec.jumlah_ranting} </td>
                        <td> <Link href={`/kecamatan/${kec._id}`}> Detail </Link> </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
  
  );
}

export default Dashboard;
