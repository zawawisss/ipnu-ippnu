"use client";
import { useEffect, useMemo, useState } from "react";
import { Chip } from "@heroui/react";
import StatisticsCard from "./statistik";

interface Database {
  _id: string;
  kecamatan: string;
  status_sp: string;
  tanggal_berakhir: string;
}

function KecamatanDetail({ id }: { id: string }) {
  const [data, setData] = useState<Database | null>(null);
  const [total, setTotal] = useState<{
    totalDesa: number;
    totalSekolah: number;
    totalAnggota: number;
  }>({ totalDesa: 0, totalSekolah: 0, totalAnggota: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [desaList, setDesaList] = useState<any[]>([]);
  const [sekolahList, setSekolahList] = useState<any[]>([]);
  const [anggotaList, setAnggotaList] = useState<any[]>([]);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const filteredDesa = useMemo(() => {
    return desaList.filter((desa) =>
      desa.nama_desa?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, desaList]);

  const filteredSekolah = useMemo(() => {
    return sekolahList.filter((sekolah) =>
      sekolah.sekolah_maarif?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, sekolahList]);

  const filteredAnggota = useMemo(() => {
    return anggotaList.filter((anggota) =>
      anggota.nama_anggota?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, anggotaList]);
  useEffect(() => {
    async function fetchData() {
      fetch(`/api/kecamatan/${id}/detail`)
        .then((res) => res.json())
        .then((total) => setTotal(total));
      try {
        const response = await fetch(`/api/kecamatan/${id}`);
        const result = await response.json();
        setData(result);

        const detail = await fetch(`/api/kecamatan/${id}/detail`);
        const { desa, sekolah, anggota } = await detail.json();

        setDesaList(Array.isArray(desa) ? desa : []);
        setSekolahList(Array.isArray(sekolah) ? sekolah : []);
        setAnggotaList(Array.isArray(anggota) ? anggota : []);
      } catch (error) {
        console.error("Gagal fetch detail kecamatan:", error);
      }
    }

    fetchData();
  }, [id]);

  if (!data) {
    return <p>Memuat...</p>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl font-bold text-center mb-4">
            STATISTIK KECAMATAN {data.kecamatan}
          </h2>
          <div className="flex justify-center gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold mb-1">Status SP</p>
              <Chip
                color={data.status_sp === "Aktif" ? "success" : "danger"}
                variant="flat"
              >
                {data.status_sp}
              </Chip>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Tanggal SP</p>
              <p className="font-medium">{data.tanggal_berakhir ? new Date(data.tanggal_berakhir).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
              }): "-"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatisticsCard
              title={"Ranting"}
              value={total.totalDesa}
              icon={"lucide:building"}
              color={"primary"}
            />
            <StatisticsCard
              title={"Komisariat"}
              value={total.totalSekolah}
              icon={"lucide:school"}
              color={"success"}
            />
            <StatisticsCard
              title={"Anggota"}
              value={total.totalAnggota}
              icon={"lucide:git-branch"}
              color={"warning"}
            />
          </div>
        </div>

        {/* TABEL DESA */}
        <div className="mt-6">
          <h2 className="font-bold mb-2">Daftar Desa</h2>
          <div>
            <input
              type="text"
              placeholder="Cari desa, sekolah, atau anggota..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="input input-bordered w-full"
            />
          </div>
          {desaList.length === 0 ? (
            <p>Belum Ada Desa yang Terdaftar</p>
          ) : (
            <table className="table-auto w-full border">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama Desa</th>
                  <th>Status SP</th>
                  <th>Tanggal SP</th>
                </tr>
              </thead>
              <tbody>
                {filteredDesa.map((desa, index) => (
                  <tr key={desa._id}>
                    <td>{index + 1}</td>
                    <td>{desa.nama_desa}</td>
                    <td>{desa.status_sp}</td>
                    <td>
                      {desa.tanggal_sp
                        ? new Date(desa.tanggal_sp).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* TABEL SEKOLAH */}
        <div className="mt-6">
          <h2 className="font-bold mb-2">Daftar Sekolah</h2>
          <div>
            <input
              type="text"
              placeholder="Cari desa, sekolah, atau anggota..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="input input-bordered w-full"
            />
          </div>
          {sekolahList.length === 0 ? (
            <p>Belum Ada Sekolah yang Terdaftar</p>
          ) : (
            <table className="table-auto w-full border">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama Sekolah</th>
                  <th>Status SP</th>
                  <th>Tanggal SP</th>
                </tr>
              </thead>
              <tbody>
                {filteredSekolah.map((sekolah, index) => (
                  <tr key={sekolah._id}>
                    <td>{index + 1}</td>
                    <td>{sekolah.sekolah_maarif}</td>
                    <td>{sekolah.status_sp}</td>
                    <td>
                      {sekolah.tanggal_sp
                        ? new Date(sekolah.tanggal_sp).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* TABEL ANGGOTA */}
        <div className="mt-6">
          <h2 className="font-bold mb-2">Daftar Anggota</h2>
          <div>
            <input
              type="text"
              placeholder="Cari desa, sekolah, atau anggota..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="input input-bordered w-full"
            />
          </div>
          {anggotaList.length === 0 ? (
            <p>Belum Ada Anggota yang Terdaftar</p>
          ) : (
            <table className="table-auto w-full border">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama Anggota</th>
                  <th>Jabatan</th>
                  <th>Pengkaderan</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnggota.map((anggota, index) => (
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
      </main>
    </div>
  );
}

export default KecamatanDetail;
