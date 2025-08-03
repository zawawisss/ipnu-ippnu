"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Chip,
  Divider,
  Spacer
} from "@heroui/react";
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface FormData {
  namaAcara: string;
  departemen: string;
  statusAcara: string;
  penanggungJawab: {
    nama: string;
    jabatan: string;
    kontak: string;
  };
  jadwalAcara: {
    tanggalMulai: string;
    tanggalSelesai: string;
    jamMulai: string;
    jamSelesai: string;
    tempatAcara: {
      nama: string;
      alamat: string;
      kota: string;
    };
  };
  daftarKebutuhan: {
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
  }[];
  koordinasi: {
    id: string;
    pihak: string;
    jenisKoordinasi: string;
    topik: string;
    kontakPerson: string;
    status: string;
    pic: string;
  }[];
  tugasPanitia: {
    id: string;
    namaAnggota: string;
    jabatan: string;
    tugasUtama: string;
    daftarTugas: {
      id: string;
      tugas: string;
      deadline: string;
      prioritas: string;
      status: string;
      catatan: string;
    }[];
  }[];
  anggaranProgres: {
    totalAnggaranRencana: number;
    totalRealisasi: number;
    rincianBiaya: {
      id: string;
      kategori: string;
      item: string;
      anggaranRencana: number;
      realisasi: number;
      status: string;
      catatan: string;
    }[];
  };
}

const ProgresLaporanAcaraForm: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    namaAcara: "",
    departemen: "",
    statusAcara: "Perencanaan",
    penanggungJawab: {
      nama: "",
      jabatan: "",
      kontak: "",
    },
    jadwalAcara: {
      tanggalMulai: "",
      tanggalSelesai: "",
      jamMulai: "",
      jamSelesai: "",
      tempatAcara: {
        nama: "",
        alamat: "",
        kota: "",
      },
    },
    daftarKebutuhan: [{
      id: Date.now().toString(),
      kategori: "Konsumsi",
      item: "",
      kuantitas: 0,
      satuan: "",
      estimasiBiaya: 0,
      prioritas: "Sedang",
      status: "Belum",
      pic: "",
      catatan: ""
    }],
    koordinasi: [{
      id: Date.now().toString(),
      pihak: "",
      jenisKoordinasi: "Internal",
      topik: "",
      kontakPerson: "",
      status: "Belum Dimulai",
      pic: ""
    }],
    tugasPanitia: [{
      id: Date.now().toString(),
      namaAnggota: "",
      jabatan: "",
      tugasUtama: "",
      daftarTugas: [{
        id: Date.now().toString() + "_task",
        tugas: "",
        deadline: "",
        prioritas: "Sedang",
        status: "Belum Mulai",
        catatan: ""
      }]
    }],
    anggaranProgres: {
      totalAnggaranRencana: 0,
      totalRealisasi: 0,
      rincianBiaya: [{
        id: Date.now().toString(),
        kategori: "",
        item: "",
        anggaranRencana: 0,
        realisasi: 0,
        status: "Belum Bayar",
        catatan: ""
      }]
    }
  });

  // Auto-save to localStorage
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      localStorage.setItem("progresLaporanAcaraDraft", JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(saveTimeout);
  }, [formData]);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("progresLaporanAcaraDraft");
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/progres-laporan-acara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Gagal menyimpan progres");
      setSuccess(true);
      localStorage.removeItem("progresLaporanAcaraDraft");
      setTimeout(() => router.push("/admin_ipnu/progres-laporan-acara"), 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const addKebutuhan = () => {
    setFormData({
      ...formData,
      daftarKebutuhan: [...formData.daftarKebutuhan, {
        id: Date.now().toString(),
        kategori: "Konsumsi",
        item: "",
        kuantitas: 0,
        satuan: "",
        estimasiBiaya: 0,
        prioritas: "Sedang",
        status: "Belum",
        pic: "",
        catatan: ""
      }]
    });
  };

  const removeKebutuhan = (id: string) => {
    setFormData({
      ...formData,
      daftarKebutuhan: formData.daftarKebutuhan.filter(item => item.id !== id)
    });
  };

  const updateKebutuhan = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      daftarKebutuhan: formData.daftarKebutuhan.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const steps = [
    { number: 1, title: "Informasi Dasar", icon: DocumentTextIcon },
    { number: 2, title: "Jadwal & Tempat", icon: CalendarIcon },
    { number: 3, title: "Kebutuhan Acara", icon: CheckCircleIcon },
    { number: 4, title: "Koordinasi", icon: UserGroupIcon },
    { number: 5, title: "Tugas Panitia", icon: ClockIcon },
    { number: 6, title: "Anggaran", icon: CurrencyDollarIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Progres Laporan Acara</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.number;
              const isCompleted = step > s.number;
              
              return (
                <div key={s.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    isActive ? 'bg-blue-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 
                    'bg-gray-200 text-gray-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : 
                      isCompleted ? 'text-green-600' : 
                      'text-gray-500'
                    }`}>
                      {s.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Informasi Dasar Acara</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    type="text"
                    label="Nama Acara"
                    placeholder="Masukkan nama acara"
                    isRequired
                    variant="bordered"
                    value={formData.namaAcara}
                    onChange={(e) => setFormData({...formData, namaAcara: e.target.value})}
                    startContent={
                      <DocumentTextIcon className="w-4 h-4 pointer-events-none flex-shrink-0 text-default-400" />
                    }
                  />
                </div>
                
                <div>
                  <Input
                    type="text"
                    label="Departemen"
                    placeholder="Masukkan departemen"
                    isRequired
                    variant="bordered"
                    value={formData.departemen}
                    onChange={(e) => setFormData({...formData, departemen: e.target.value})}
                    startContent={
                      <UserGroupIcon className="w-4 h-4 pointer-events-none flex-shrink-0 text-default-400" />
                    }
                  />
                </div>
                
                <div>
                  <Select 
                    label="Status Acara"
                    placeholder="Pilih status acara"
                    variant="bordered"
                    selectedKeys={[formData.statusAcara]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      setFormData({...formData, statusAcara: value});
                    }}
                  >
                    <SelectItem key="Perencanaan">Perencanaan</SelectItem>
                    <SelectItem key="Persiapan">Persiapan</SelectItem>
                    <SelectItem key="Pelaksanaan">Pelaksanaan</SelectItem>
                    <SelectItem key="Selesai">Selesai</SelectItem>
                  </Select>
                </div>
              </div>
              
              <Divider className="my-6" />
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Penanggung Jawab</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      type="text"
                      label="Nama"
                      placeholder="Nama penanggung jawab"
                      isRequired
                      variant="bordered"
                      value={formData.penanggungJawab.nama}
                      onChange={(e) => setFormData({
                        ...formData,
                        penanggungJawab: {...formData.penanggungJawab, nama: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      label="Jabatan"
                      placeholder="Jabatan dalam organisasi"
                      isRequired
                      variant="bordered"
                      value={formData.penanggungJawab.jabatan}
                      onChange={(e) => setFormData({
                        ...formData,
                        penanggungJawab: {...formData.penanggungJawab, jabatan: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <Input
                      type="tel"
                      label="Kontak"
                      placeholder="Nomor telepon"
                      isRequired
                      variant="bordered"
                      value={formData.penanggungJawab.kontak}
                      onChange={(e) => setFormData({
                        ...formData,
                        penanggungJawab: {...formData.penanggungJawab, kontak: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Schedule & Venue */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Jadwal & Tempat Acara</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai *</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                    value={formData.jadwalAcara.tanggalMulai}
                    onChange={(e) => setFormData({
                      ...formData,
                      jadwalAcara: {...formData.jadwalAcara, tanggalMulai: e.target.value}
                    })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai *</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                    value={formData.jadwalAcara.tanggalSelesai}
                    onChange={(e) => setFormData({
                      ...formData,
                      jadwalAcara: {...formData.jadwalAcara, tanggalSelesai: e.target.value}
                    })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai *</label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                    value={formData.jadwalAcara.jamMulai}
                    onChange={(e) => setFormData({
                      ...formData,
                      jadwalAcara: {...formData.jadwalAcara, jamMulai: e.target.value}
                    })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai *</label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                    value={formData.jadwalAcara.jamSelesai}
                    onChange={(e) => setFormData({
                      ...formData,
                      jadwalAcara: {...formData.jadwalAcara, jamSelesai: e.target.value}
                    })}
                    required
                  />
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tempat Acara</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Tempat *</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                      value={formData.jadwalAcara.tempatAcara.nama}
                      onChange={(e) => setFormData({
                        ...formData,
                        jadwalAcara: {
                          ...formData.jadwalAcara,
                          tempatAcara: {...formData.jadwalAcara.tempatAcara, nama: e.target.value}
                        }
                      })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alamat *</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={formData.jadwalAcara.tempatAcara.alamat}
                      onChange={(e) => setFormData({
                        ...formData,
                        jadwalAcara: {
                          ...formData.jadwalAcara,
                          tempatAcara: {...formData.jadwalAcara.tempatAcara, alamat: e.target.value}
                        }
                      })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kota *</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                      value={formData.jadwalAcara.tempatAcara.kota}
                      onChange={(e) => setFormData({
                        ...formData,
                        jadwalAcara: {
                          ...formData.jadwalAcara,
                          tempatAcara: {...formData.jadwalAcara.tempatAcara, kota: e.target.value}
                        }
                      })}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Requirements */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Kebutuhan Acara</h2>
                <button
                  type="button"
                  onClick={addKebutuhan}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Tambah Kebutuhan
                </button>
              </div>

              <div className="space-y-4">
                {formData.daftarKebutuhan.map((kebutuhan, index) => (
                  <div key={kebutuhan.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Kebutuhan {index + 1}</h3>
                      {formData.daftarKebutuhan.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeKebutuhan(kebutuhan.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                        <select
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                          value={kebutuhan.kategori}
                          onChange={(e) => updateKebutuhan(kebutuhan.id, 'kategori', e.target.value)}
                        >
                          <option value="Konsumsi">Konsumsi</option>
                          <option value="Tempat">Tempat</option>
                          <option value="Peralatan">Peralatan</option>
                          <option value="Transportasi">Transportasi</option>
                          <option value="Akomodasi">Akomodasi</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Item *</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                          value={kebutuhan.item}
                          onChange={(e) => updateKebutuhan(kebutuhan.id, 'item', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">PIC *</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                          value={kebutuhan.pic}
                          onChange={(e) => updateKebutuhan(kebutuhan.id, 'pic', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kuantitas</label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                          value={kebutuhan.kuantitas}
                          onChange={(e) => updateKebutuhan(kebutuhan.id, 'kuantitas', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Satuan</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                          value={kebutuhan.satuan}
                          onChange={(e) => updateKebutuhan(kebutuhan.id, 'satuan', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estimasi Biaya</label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                          value={kebutuhan.estimasiBiaya}
                          onChange={(e) => updateKebutuhan(kebutuhan.id, 'estimasiBiaya', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prioritas</label>
                        <select
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                          value={kebutuhan.prioritas}
                          onChange={(e) => updateKebutuhan(kebutuhan.id, 'prioritas', e.target.value)}
                        >
                          <option value="Tinggi">Tinggi</option>
                          <option value="Sedang">Sedang</option>
                          <option value="Rendah">Rendah</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                          value={kebutuhan.status}
                          onChange={(e) => updateKebutuhan(kebutuhan.id, 'status', e.target.value)}
                        >
                          <option value="Belum">Belum</option>
                          <option value="Proses">Proses</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        value={kebutuhan.catatan}
                        onChange={(e) => updateKebutuhan(kebutuhan.id, 'catatan', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              className={`px-6 py-3 rounded-lg font-medium ${
                step === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
              disabled={step === 1}
            >
              Sebelumnya
            </button>
            
            <div className="text-sm text-gray-500">
              Langkah {step} dari {steps.length}
            </div>
            
            {step === steps.length ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan Progres'}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Selanjutnya
              </button>
            )}
          </div>
          
          {/* Success/Error Messages */}
          {success && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              Progres berhasil disimpan! Mengalihkan ke dashboard...
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgresLaporanAcaraForm;
