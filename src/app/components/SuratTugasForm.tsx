"use client";

// components/SuratTugasForm.js
import { useState } from 'react';

interface FormData {
  nama: string;
  tempatTanggalLahir: string;
  jabatan: string;
  alamat: string;
  kegiatan: string;
  penyelenggara: string;
  tempat: string;
  tanggalKegiatan: string;
}

type FormDataFields = [keyof FormData, string][];

export default function SuratTugasForm() {
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    tempatTanggalLahir: '',
    jabatan: '',
    alamat: '',
    kegiatan: '',
    penyelenggara: '',
    tempat: '',
    tanggalKegiatan: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch('/api/generate-surat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SuratTugas.docx';
      a.click();
    } else {
      alert('Gagal membuat surat');
    }

    setLoading(false);
  };

  const fields: FormDataFields = [
    ['nama', 'Nama Lengkap'],
    ['tempatTanggalLahir', 'Tempat / Tanggal Lahir'],
    ['jabatan', 'Jabatan'],
    ['alamat', 'Alamat'],
    ['kegiatan', 'Mengikuti Kegiatan'],
    ['penyelenggara', 'Diselenggarakan oleh'],
    ['tempat', 'Tempat Kegiatan'],
    ['tanggalKegiatan', 'Tanggal Kegiatan'],
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto p-6 bg-white rounded shadow">
      {fields.map(([name, label]) => (
        <div key={name}>
          <label className="block font-medium">{label}</label>
          <input
            type="text"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {loading ? 'Membuat Surat...' : 'Generate Surat'}
      </button>
    </form>
  );
}
