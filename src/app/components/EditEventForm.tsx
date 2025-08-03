
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// A simplified Event type for the form
interface EventFormData {
  namaAcara: string;
  departemen: string;
  statusAcara: string;
  jadwalAcara: {
    tanggalMulai: string;
    tanggalSelesai: string;
  };
}

const EditEventForm = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [formData, setFormData] = useState<EventFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchEventData = async () => {
      try {
        const response = await fetch(`/api/progres-laporan-acara/${id}`);
        if (!response.ok) throw new Error('Gagal memuat data event');
        const data = await response.json();
        if (data.success) {
            // Format dates for input[type=date]
            const event = data.data;
            setFormData({
                ...event,
                jadwalAcara: {
                    ...event.jadwalAcara,
                    tanggalMulai: new Date(event.jadwalAcara.tanggalMulai).toISOString().split('T')[0],
                    tanggalSelesai: new Date(event.jadwalAcara.tanggalSelesai).toISOString().split('T')[0],
                }
            });
        } else {
          throw new Error(data.error || 'Data event tidak ditemukan');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => prev ? { ...prev, [parent]: { ...(prev as any)[parent], [child]: value } } : null);
    } else {
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/progres-laporan-acara/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memperbarui event');
      }

      // Redirect back to the detail page
      router.push(`/admin_ipnu/event/${id}`);
      router.refresh(); // Refresh data on the detail page
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  if (!formData) return <div className="text-center py-20">Event tidak ditemukan.</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push(`/admin_ipnu/event/${id}`)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeftIcon className="h-5 w-5" />
          Batal & Kembali ke Detail Event
        </button>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Event</h1>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="namaAcara" className="block text-sm font-medium text-gray-700 mb-1">Nama Acara</label>
              <input
                id="namaAcara" name="namaAcara"
                type="text"
                value={formData.namaAcara}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>
             <div>
              <label htmlFor="departemen" className="block text-sm font-medium text-gray-700 mb-1">Departemen</label>
              <input
                id="departemen" name="departemen"
                type="text"
                value={formData.departemen}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tanggalMulai" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input
                  id="tanggalMulai" name="jadwalAcara.tanggalMulai"
                  type="date"
                  value={formData.jadwalAcara.tanggalMulai}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3"
                />
              </div>
              <div>
                <label htmlFor="tanggalSelesai" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                <input
                  id="tanggalSelesai" name="jadwalAcara.tanggalSelesai"
                  type="date"
                  value={formData.jadwalAcara.tanggalSelesai}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3"
                />
              </div>
            </div>
            <div>
                <label htmlFor="statusAcara" className="block text-sm font-medium text-gray-700 mb-1">Status Acara</label>
                <select 
                    id="statusAcara" 
                    name="statusAcara"
                    value={formData.statusAcara}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 bg-white"
                >
                    <option value="Draft">Draft</option>
                    <option value="Persiapan">Persiapan</option>
                    <option value="Pelaksanaan">Pelaksanaan</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                </select>
            </div>
          </div>

          <div className="mt-8 border-t pt-6 flex justify-end">
            <button type="submit" className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventForm;

