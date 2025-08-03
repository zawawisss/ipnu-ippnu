"use client";
import React, { useState } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";

interface DynamicField {
  id: number;
  value: string;
}

const LaporanKegiatanForm: React.FC = () => {
  // State untuk field form
  const [namaKegiatan, setNamaKegiatan] = useState("");
  const [departemen, setDepartemen] = useState("");
  const [tanggalPelaksanaan, setTanggalPelaksanaan] = useState("");
  const [tempat, setTempat] = useState("");
  const [penanggungJawab, setPenanggungJawab] = useState("");
  const [koordinasi, setKoordinasi] = useState<DynamicField[]>([
    { id: 1, value: "" },
  ]);
  const [administrasi, setAdministrasi] = useState<DynamicField[]>([
    { id: 1, value: "" },
  ]);
  const [custom, setCustom] = useState<DynamicField[]>([{ id: 1, value: "" }]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  // Modal untuk notifikasi
  const [openDialog, setOpenDialog] = useState(false);

  const handleChange = (
    arr: DynamicField[],
    setArr: React.Dispatch<React.SetStateAction<DynamicField[]>>,
    idx: number,
    value: string
  ) => {
    const newArr = arr.map((item, i) =>
      i === idx ? { ...item, value } : item
    );
    setArr(newArr);
  };

  const handleAddField = (
    arr: DynamicField[],
    setArr: React.Dispatch<React.SetStateAction<DynamicField[]>>
  ) => {
    setArr([...arr, { id: arr.length + 1, value: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      // Minimal mapping sesuai model
      const body = {
        namaAcara: namaKegiatan,
        departemen,
        tempatAcara: { nama: tempat },
        waktuPelaksanaan: { tanggalMulai: tanggalPelaksanaan },
        penanggungJawab: { nama: penanggungJawab },
        koordinasi: { internal: koordinasi.map((k) => k.value) },
        administrasi: administrasi.map((a) => a.value),
        keterangan: custom.map((c) => c.value),
      };
      const res = await fetch("/api/laporan-acara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Gagal kirim laporan");
      setSuccess(true);
      setOpenDialog(true);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      setOpenDialog(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <form
        className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-100"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700">
          <CheckCircleIcon className="h-7 w-7 text-green-500" />
          Form Laporan Kegiatan/Acara
        </h2>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Nama Kegiatan
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Nama Kegiatan"
            value={namaKegiatan}
            onChange={(e) => setNamaKegiatan(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Departemen/Pelaksana
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Departemen/Pelaksana"
            value={departemen}
            onChange={(e) => setDepartemen(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Tanggal Pelaksanaan
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={tanggalPelaksanaan}
              onChange={(e) => setTanggalPelaksanaan(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Tempat
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Tempat"
              value={tempat}
              onChange={(e) => setTempat(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Penanggung Jawab Kegiatan
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Penanggung Jawab"
            value={penanggungJawab}
            onChange={(e) => setPenanggungJawab(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Koordinasi
          </label>
          <div className="space-y-2">
            {koordinasi.map((item, idx) => (
              <div key={item.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder={`Koordinasi ${idx + 1}`}
                  value={item.value}
                  onChange={(e) =>
                    handleChange(koordinasi, setKoordinasi, idx, e.target.value)
                  }
                  required={idx === 0}
                />
                <button
                  type="button"
                  onClick={() => handleAddField(koordinasi, setKoordinasi)}
                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-5 w-5 text-blue-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Administrasi
          </label>
          <div className="space-y-2">
            {administrasi.map((item, idx) => (
              <div key={item.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder={`Administrasi ${idx + 1}`}
                  value={item.value}
                  onChange={(e) =>
                    handleChange(
                      administrasi,
                      setAdministrasi,
                      idx,
                      e.target.value
                    )
                  }
                  required={idx === 0}
                />
                <button
                  type="button"
                  onClick={() => handleAddField(administrasi, setAdministrasi)}
                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-5 w-5 text-blue-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Checklist/Keterangan Lain
          </label>
          <div className="space-y-2">
            {custom.map((item, idx) => (
              <div key={item.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder={`Keterangan ${idx + 1}`}
                  value={item.value}
                  onChange={(e) =>
                    handleChange(custom, setCustom, idx, e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => handleAddField(custom, setCustom)}
                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-5 w-5 text-blue-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold py-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-green-600 transition"
          disabled={loading}
        >
          {loading ? "Mengirim..." : "Kirim Laporan"}
        </button>
      </form>
      {/* Modal notifikasi */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        className="fixed z-50 inset-0 flex items-center justify-center"
      >
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm mx-auto flex flex-col items-center">
          {success ? (
            <>
              <CheckCircleIcon className="h-12 w-12 text-green-500 mb-2" />
              <h3 className="text-lg font-bold mb-2">
                Laporan berhasil dikirim!
              </h3>
            </>
          ) : (
            <>
              <ExclamationCircleIcon className="h-12 w-12 text-red-500 mb-2" />
              <h3 className="text-lg font-bold mb-2">Gagal mengirim laporan</h3>
              <p className="text-red-600">{error}</p>
            </>
          )}
          <button
            onClick={() => setOpenDialog(false)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Tutup
          </button>
        </div>
      </Dialog>
    </div>
  );
};

export default LaporanKegiatanForm;
