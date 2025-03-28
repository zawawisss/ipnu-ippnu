"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Dashboard() {
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
    <>
    
      <p> ANAK CABANG : {data.totalKecamatan} </p>
      <p> RANTING : {data.totalDesa} </p>
      <p> KOMISARIAT : {data.totalSekolahMaarif} </p>
      <p> Anggota : {data.totalAnggota} </p>

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
    </>
  );
}
