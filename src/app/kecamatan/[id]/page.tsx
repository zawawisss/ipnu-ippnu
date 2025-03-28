import db from "@/lib/db";
import Anggota from "@/models/Anggota";
import Desa from "@/models/Desa";
import Kecamatan from "@/models/Kecamatan";
import Sekolah from "@/models/Sekolah";
import mongoose from "mongoose";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function detail({ params }: Props) {
  await db();
  const { id } = await params;

  // Validasi ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return <div>ID Kecamatan tidak valid</div>;
  }

  const kecamatanId = id;
  const kecamatan = await Kecamatan.findOne({ _id: kecamatanId });
  const desaList = await Desa.find({ kecamatan_id: id });
  const sekolahList = await Sekolah.find({ kecamatan_id: id })
  const anggotaList = await Anggota.find({kecamatan_id:id})

  return (
    <>
      <div>
        <h1>Kecamatan: {kecamatan.kecamatan}</h1>
        <p>Status SP: {kecamatan.status_sp}</p>
        <p>Tanggal SP: {kecamatan.tanggal_berakhir}</p>
      </div>
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
        )}
      </div>
    </>
  );
}

export default detail;
