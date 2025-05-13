"use client";

"use client";

// components/SuratTugasForm.js
import { useState } from 'react';
import { PlusCircleIcon, MinusCircleIcon } from '@heroicons/react/24/solid';

interface Assignee {
  nama: string;
  tempatTanggalLahir: string;
  jabatan: string;
  alamat: string;
}

interface FormData {
  assignees: Assignee[];
  kegiatan: string;
  penyelenggara: string;
  tempat: string;
  tanggalKegiatan: string;
}

export default function SuratTugasForm() {
  const [formData, setFormData] = useState<FormData>({
    assignees: [{ nama: '', tempatTanggalLahir: '', jabatan: '', alamat: '' }],
    kegiatan: '',
    penyelenggara: '',
    tempat: '',
    tanggalKegiatan: '',
  });

  const [loading, setLoading] = useState(false);

  const handleAssigneeChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newAssignees = [...formData.assignees];
    newAssignees[index] = { ...newAssignees[index], [e.target.name]: e.target.value };
    setFormData((prev) => ({ ...prev, assignees: newAssignees }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addAssignee = () => {
    setFormData((prev) => ({
      ...prev,
      assignees: [...prev.assignees, { nama: '', tempatTanggalLahir: '', jabatan: '', alamat: '' }],
    }));
  };

  const removeAssignee = (index: number) => {
    const newAssignees = formData.assignees.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, assignees: newAssignees }));
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

  const eventFields = [
    ['kegiatan', 'Mengikuti Kegiatan'],
    ['penyelenggara', 'Diselenggarakan oleh'],
    ['tempat', 'Tempat Kegiatan'],
    ['tanggalKegiatan', 'Tanggal Kegiatan'],
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto p-6 bg-white rounded shadow dark:bg-gray-900 dark:text-gray-200 dark:shadow-lg">
      {formData.assignees.map((assignee, index) => (
        <div key={index} className="border p-4 rounded space-y-2 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold dark:text-gray-200">Penerima Tugas {index + 1}</h3>
            {formData.assignees.length > 1 && (
              <button
                type="button"
                onClick={() => removeAssignee(index)}
                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                aria-label="Hapus Penerima Tugas"
              >
                <MinusCircleIcon className="h-6 w-6" />
              </button>
            )}
          </div>
          <div>
            <label className="block font-medium dark:text-gray-300">Nama Lengkap</label>
            <input
              type="text"
              name="nama"
              value={assignee.nama}
              onChange={(e) => handleAssigneeChange(index, e)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <div>
            <label className="block font-medium dark:text-gray-300">Tempat / Tanggal Lahir</label>
            <input
              type="text"
              name="tempatTanggalLahir"
              value={assignee.tempatTanggalLahir}
              onChange={(e) => handleAssigneeChange(index, e)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <div>
            <label className="block font-medium dark:text-gray-300">Jabatan</label>
            <input
              type="text"
              name="jabatan"
              value={assignee.jabatan}
              onChange={(e) => handleAssigneeChange(index, e)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <div>
            <label className="block font-medium dark:text-gray-300">Alamat</label>
            <input
              type="text"
              name="alamat"
              value={assignee.alamat}
              onChange={(e) => handleAssigneeChange(index, e)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addAssignee}
        className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
      >
        <PlusCircleIcon className="h-6 w-6" />
        <span>Tambah Penerima Tugas</span>
      </button>

      <div className="space-y-4 border p-4 rounded dark:border-gray-700">
        <h3 className="text-lg font-semibold dark:text-gray-200">Detail Kegiatan</h3>
        {eventFields.map(([name, label]) => (
          <div key={name}>
            <label className="block font-medium dark:text-gray-300">{label}</label>
          <input
            type="text"
            name={name}
            value={formData[name as 'kegiatan' | 'penyelenggara' | 'tempat' | 'tanggalKegiatan']}
            onChange={handleInputChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            required
          />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
      >
        {loading ? 'Membuat Surat...' : 'Generate Surat'}
      </button>
    </form>
  );
}
