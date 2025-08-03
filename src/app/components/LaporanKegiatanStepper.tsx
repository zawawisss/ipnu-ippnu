"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  InformationCircleIcon,
  CalendarIcon,
  MapPinIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Tab } from "@headlessui/react";

interface DynamicField {
  id: number;
  value: string;
  status: string;
}

const LaporanKegiatanStepper: React.FC = () => {
  const [namaKegiatan, setNamaKegiatan] = useState("");
  const [departemen, setDepartemen] = useState("");
  const [tanggalPelaksanaan, setTanggalPelaksanaan] = useState("");
  const [tempat, setTempat] = useState("");
  const [penanggungJawab, setPenanggungJawab] = useState("");
  const [koordinasi, setKoordinasi] = useState<DynamicField[]>([
    { id: 1, value: "", status: "" },
  ]);
  const [administrasi, setAdministrasi] = useState<DynamicField[]>([
    { id: 1, value: "", status: "" },
  ]);
  const [custom, setCustom] = useState<DynamicField[]>([
    { id: 1, value: "", status: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [savedTime, setSavedTime] = useState("");

  // Auto-save functionality
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      const formData = {
        namaKegiatan,
        departemen,
        tanggalPelaksanaan,
        tempat,
        penanggungJawab,
        koordinasi,
        administrasi,
        custom,
      };
      localStorage.setItem("laporanAcaraDraft", JSON.stringify(formData));
      setSavedTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [
    namaKegiatan,
    departemen,
    tanggalPelaksanaan,
    tempat,
    penanggungJawab,
    koordinasi,
    administrasi,
    custom,
  ]);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("laporanAcaraDraft");
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setNamaKegiatan(draft.namaKegiatan || "");
      setDepartemen(draft.departemen || "");
      setTanggalPelaksanaan(draft.tanggalPelaksanaan || "");
      setTempat(draft.tempat || "");
      setPenanggungJawab(draft.penanggungJawab || "");
      setKoordinasi(draft.koordinasi || [{ id: 1, value: "", status: "" }]);
      setAdministrasi(draft.administrasi || [{ id: 1, value: "", status: "" }]);
      setCustom(draft.custom || [{ id: 1, value: "", status: "" }]);
    }
  }, []);

  const handleChange = (
    arr: DynamicField[],
    setArr: React.Dispatch<React.SetStateAction<DynamicField[]>>,
    idx: number,
    field: "value" | "status",
    value: string
  ) => {
    const newArr = arr.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setArr(newArr);
  };

  const handleAddField = (
    arr: DynamicField[],
    setArr: React.Dispatch<React.SetStateAction<DynamicField[]>>
  ) => {
    setArr([...arr, { id: Date.now(), value: "", status: "" }]);
  };

  const handleRemoveField = (
    arr: DynamicField[],
    setArr: React.Dispatch<React.SetStateAction<DynamicField[]>>,
    id: number
  ) => {
    if (arr.length > 1) {
      setArr(arr.filter((item) => item.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const body = {
        namaKegiatan,
        departemen,
        tanggalPelaksanaan,
        tempat,
        penanggungJawab,
        koordinasi: koordinasi.map((k) => ({ value: k.value, status: k.status })),
        administrasi: administrasi.map((a) => ({ value: a.value, status: a.status })),
        keterangan: custom.map((c) => ({ value: c.value, status: c.status })),
      };
      const res = await fetch("/api/laporan-acara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Gagal kirim laporan");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
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
              <div key={item.id} className="space-y-2 p-2 border rounded-md">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder={`Koordinasi ${idx + 1}`}
                  value={item.value}
                  onChange={(e) =>
                    handleChange(koordinasi, setKoordinasi, idx, "value", e.target.value)
                  }
                  required={idx === 0}
                />
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="Status"
                  value={item.status}
                  onChange={(e) =>
                    handleChange(koordinasi, setKoordinasi, idx, "status", e.target.value)
                  }
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
              <div key={item.id} className="space-y-2 p-2 border rounded-md">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder={`Administrasi ${idx + 1}`}
                  value={item.value}
                  onChange={(e) =>
                    handleChange(administrasi, setAdministrasi, idx, "value", e.target.value)
                  }
                  required={idx === 0}
                />
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="Status"
                  value={item.status}
                  onChange={(e) =>
                    handleChange(administrasi, setAdministrasi, idx, "status", e.target.value)
                  }
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
              <div key={item.id} className="space-y-2 p-2 border rounded-md">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder={`Keterangan ${idx + 1}`}
                  value={item.value}
                  onChange={(e) =>
                    handleChange(custom, setCustom, idx, "value", e.target.value)
                  }
                />
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="Status"
                  value={item.status}
                  onChange={(e) =>
                    handleChange(custom, setCustom, idx, "status", e.target.value)
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
    </div>
  );
};

export default LaporanKegiatanStepper;

