"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

interface JadwalAcara {
  tanggalMulai: string;
  tanggalSelesai: string;
  jamMulai: string;
  jamSelesai: string;
  tempatAcara: {
    nama: string;
    alamat: string;
    kota: string;
  };
}

interface PenanggungJawab {
  nama: string;
  jabatan: string;
  kontak: string;
}

interface DaftarKebutuhan {
  id: string;
  kategori: string;
  item: string;
  kuantitas: number;
  satuan: string;
  estimasiBiaya: number;
  prioritas: string;
  status: string;
  pic: string;
  catatan: string;
}

const ProgresForm: React.FC = () => {
  const router = useRouter();
  const [namaAcara, setNamaAcara] = useState("");
  const [departemen, setDepartemen] = useState("");
  const [jadwalAcara, setJadwalAcara] = useState({
    tanggalMulai: "",
    tanggalSelesai: "",
    jamMulai: "",
    jamSelesai: "",
    tempatAcara: {
      nama: "",
      alamat: "",
      kota: "",
    },
  });
  const [penanggungJawab, setPenanggungJawab] = useState({
    nama: "",
    jabatan: "",
    kontak: "",
  });
  const [daftarKebutuhan, setDaftarKebutuhan] = useState([
    { id: Date.now().toString(), kategori: "", item: "", kuantitas: 0, satuan: "", estimasiBiaya: 0, prioritas: "", status: "Belum", pic: "", catatan: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const body = {
        namaAcara,
        departemen,
        jadwalAcara,
        penanggungJawab,
        daftarKebutuhan,
      };
      const res = await fetch("/api/progres-laporan-acara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Gagal menyimpan progres");
      setSuccess(true);
      router.push("/admin_ipnu/progres-laporan-acara");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <form
        className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg space-y-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-gray-900">Progres Laporan Acara</h2>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Nama Acara</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3"
            value={namaAcara}
            onChange={(e) => setNamaAcara(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Departemen</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3"
            value={departemen}
            onChange={(e) => setDepartemen(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Penanggung Jawab</label>
          <input
            type="text"
            placeholder="Nama"
            className="w-full border border-gray-300 rounded-lg p-3 mb-2"
            value={penanggungJawab.nama}
            onChange={(e) => setPenanggungJawab({ ...penanggungJawab, nama: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Jabatan"
            className="w-full border border-gray-300 rounded-lg p-3 mb-2"
            value={penanggungJawab.jabatan}
            onChange={(e) => setPenanggungJawab({ ...penanggungJawab, jabatan: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="Kontak"
            className="w-full border border-gray-300 rounded-lg p-3"
            value={penanggungJawab.kontak}
            onChange={(e) => setPenanggungJawab({ ...penanggungJawab, kontak: e.target.value })}
            required
          />
        </div>
        <div>
          <button
            type="button"
            onClick={() =>
              setDaftarKebutuhan([...daftarKebutuhan, { id: Date.now().toString(), kategori: "", item: "", kuantitas: 0, satuan: "", estimasiBiaya: 0, prioritas: "", status: "Belum", pic: "", catatan: "" }])
            }
            className="py-2 px-4 bg-blue-500 text-white rounded-lg"
          >
            Tambah Kebutuhan
          </button>
          {daftarKebutuhan.map((kebutuhan, index) => (
            <div key={kebutuhan.id} className="mt-4">
              <h4 className="font-semibold text-gray-800">Kebutuhan {index + 1}</h4>
              <input
                type="text"
                placeholder="Kategori"
                className="w-full border border-gray-300 rounded-lg p-3 mb-2"
                value={kebutuhan.kategori}
                onChange={(e) => {
                  const newKebutuhan = [...daftarKebutuhan];
                  newKebutuhan[index].kategori = e.target.value;
                  setDaftarKebutuhan(newKebutuhan);
                }}
                required
              />
              <input
                type="text"
                placeholder="Item"
                className="w-full border border-gray-300 rounded-lg p-3 mb-2"
                value={kebutuhan.item}
                onChange={(e) => {
                  const newKebutuhan = [...daftarKebutuhan];
                  newKebutuhan[index].item = e.target.value;
                  setDaftarKebutuhan(newKebutuhan);
                }}
                required
              />
              {/* Additional inputs for other fields like kuantitas, satuan, etc. */}
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-green-500 text-white font-bold py-3 rounded-lg"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Progres"}
          </button>
        </div>
        {success && <p className="mt-4 text-green-600">Progres berhasil disimpan!</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default ProgresForm;
