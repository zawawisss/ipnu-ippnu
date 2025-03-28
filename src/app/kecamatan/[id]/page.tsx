
import KecamatanDetail from "@/app/components/pac-data";
import db from "@/lib/db";
import Anggota from "@/models/Anggota";
import Desa from "@/models/Desa";
import Kecamatan from "@/models/Kecamatan";
import Sekolah from "@/models/Sekolah";
import { Chip } from "@heroui/react";
import mongoose from "mongoose";

interface Props {
  params: Promise<{ id: string }>;
}

async function Hasil({ params }: Props) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-grow">
      <div className="text-center mb-8 sm:mb-12">
      <KecamatanDetail id={id} />
      {/* 
      <div>
        <h2>Daftar Desa</h2>
        {desaList.length === 0 ? (
          <p>Belum Ada Desa yang Terdaftar</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nama Desa</th>
                <th>Status SP</th>
                <th>Tanggal SP</th>
              </tr>
            </thead>
            <tbody>
              {desaList.map((desa, index) => (
                <tr key={desa._id}>
                  <td>{index + 1}</td>
                  <td>{desa.nama_desa}</td>
                  <td>{desa.status_sp}</td>
                  <td>{desa.tanggal_sp ? new Date(desa.tanggal_sp).toLocaleDateString('id-ID',{
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        }): '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div>
        <h2>Daftar Sekolah</h2>
        {sekolahList.length === 0 ? (
          <p>Belum Ada Sekolah yang Terdaftar</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nama Sekolah</th>
                <th>Status SP</th>
                <th>Tanggal SP</th>
              </tr>
            </thead>
            <tbody>
              {sekolahList.map((sekolah, index) => (
                <tr key={sekolah._id}>
                  <td>{index + 1}</td>
                  <td>{sekolah.sekolah_maarif}</td>
                  <td>{sekolah.status_sp}</td>
                  <td>{sekolah.tanggal_sp ? new Date(sekolah.tanggal_sp).toLocaleDateString('id-ID',{
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        }): '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div>
        <h2>Daftar Anggota</h2>
        {anggotaList.length === 0 ? (
          <p>Belum Ada Anggota yang Terdaftar</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nama Anggota</th>
                <th>Jabatan</th>
                <th>Pengkaderan</th>
              </tr>
            </thead>
            <tbody>
              {anggotaList.map((anggota, index) => (
                <tr key={anggota._id}>
                  <td>{index + 1}</td>
                  <td>{anggota.nama_anggota}</td>
                  <td>{anggota.jabatan}</td>
                  <td>{anggota.pengkaderan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )} */}
      </div>
      </main>
    </div>
  );
}

export default Hasil;
