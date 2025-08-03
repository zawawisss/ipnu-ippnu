
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const NewEventForm = () => {
  const router = useRouter();
  const [namaAcara, setNamaAcara] = useState('');
  const [departemen, setDepartemen] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const eventData = {
      namaAcara,
      departemen,
      jadwalAcara: {
        tanggalMulai,
        tanggalSelesai,
        jamMulai: '00:00', // Default value
        jamSelesai: '00:00', // Default value
        tempatAcara: { // Default empty values
            nama: 'To be confirmed',
            alamat: 'To be confirmed',
            kota: 'To be confirmed'
        }
      },
      penanggungJawab: { // Default empty values
        nama: 'To be confirmed',
        jabatan: 'To be confirmed',
        kontak: 'To be confirmed'
      },
      // Add other necessary fields with default values
    };

    try {
      const response = await fetch('/api/progres-laporan-acara', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal membuat event baru');
      }

      router.push('/admin_ipnu/event');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeftIcon className="h-5 w-5" />
          Kembali ke Dashboard
        </button>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Buat Event Baru</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="namaAcara" className="block text-sm font-medium text-gray-700 mb-1">Nama Acara</label>
              <input
                id="namaAcara"
                type="text"
                value={namaAcara}
                onChange={(e) => setNamaAcara(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
             <div>
              <label htmlFor="departemen" className="block text-sm font-medium text-gray-700 mb-1">Departemen</label>
              <input
                id="departemen"
                type="text"
                value={departemen}
                onChange={(e) => setDepartemen(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tanggalMulai" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input
                  id="tanggalMulai"
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="tanggalSelesai" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                <input
                  id="tanggalSelesai"
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-6 flex justify-end">
            <button 
              type="submit" 
              className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEventForm;

