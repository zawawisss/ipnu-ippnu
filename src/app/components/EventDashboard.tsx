
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Event {
  _id: string;
  namaAcara: string;
  departemen: string;
  statusAcara: 'Draft' | 'Persiapan' | 'Pelaksanaan' | 'Selesai' | 'Dibatalkan';
  jadwalAcara: {
    tanggalMulai: string | Date;
    tanggalSelesai: string | Date;
    jamMulai: string;
    jamSelesai: string;
    tempatAcara: {
      nama: string;
      alamat: string;
      kota: string;
    };
  };
  penanggungJawab: {
    nama: string;
    jabatan: string;
    kontak: string;
  };
  progresKeseluruhan?: number;
  createdAt: string;
  updatedAt: string;
}

const EventDashboard = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; eventId: string; eventName: string }>({ show: false, eventId: '', eventName: '' });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/progres-laporan-acara', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data acara');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Calculate progress for each event (using virtual from schema)
          const eventsWithProgress = data.data.map((event: any) => ({
            ...event,
            progresKeseluruhan: calculateProgress(event)
          }));
          setEvents(eventsWithProgress);
        } else {
          setEvents([]);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Simple progress calculation function
  const calculateProgress = (event: any) => {
    if (!event) return 0;
    
    const totalTugas = event.tugasPanitia?.reduce(
      (acc: number, panitia: any) => acc + (panitia.daftarTugas?.length || 0),
      0
    ) || 0;
    
    const tugasSelesai = event.tugasPanitia?.reduce(
      (acc: number, panitia: any) =>
        acc + (panitia.daftarTugas?.filter((tugas: any) => tugas.status === 'Selesai')?.length || 0),
      0
    ) || 0;

    const totalKebutuhan = event.daftarKebutuhan?.length || 0;
    const kebutuhanSelesai = event.daftarKebutuhan?.filter(
      (item: any) => item.status === 'Selesai'
    )?.length || 0;

    const totalKoordinasi = event.koordinasi?.length || 0;
    const koordinasiSelesai = event.koordinasi?.filter(
      (item: any) => item.status === 'Selesai'
    )?.length || 0;

    const totalItem = totalTugas + totalKebutuhan + totalKoordinasi;
    const itemSelesai = tugasSelesai + kebutuhanSelesai + koordinasiSelesai;

    return totalItem > 0 ? Math.round((itemSelesai / totalItem) * 100) : 0;
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Persiapan': return 'bg-yellow-100 text-yellow-800';
      case 'Pelaksanaan': return 'bg-blue-100 text-blue-800';
      case 'Selesai': return 'bg-green-100 text-green-800';
      case 'Dibatalkan': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteModal.eventId) return;

    try {
      const response = await fetch(`/api/progres-laporan-acara/${deleteModal.eventId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Gagal menghapus event');
      }
      
      // Remove event from the list
      setEvents(prev => prev.filter(event => event._id !== deleteModal.eventId));
      setDeleteModal({ show: false, eventId: '', eventName: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data acara...</p>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Event</h1>
          <button
            onClick={() => router.push('/admin_ipnu/event/new')}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
          >
            <PlusIcon className="h-5 w-5" />
            Buat Event Baru
          </button>
        </div>

        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm mx-auto">
              <h2 className="text-xl font-bold text-gray-800">Konfirmasi Hapus</h2>
              <p className="text-gray-600 mt-4">Anda yakin ingin menghapus event <span className="font-bold">{deleteModal.eventName}</span>? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end gap-4 mt-8">
                <button onClick={() => setDeleteModal({ show: false, eventId: '', eventName: '' })} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg">Batal</button>
                <button onClick={handleDeleteEvent} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg">Ya, Hapus</button>
              </div>
            </div>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-xl shadow-lg p-12 max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlusIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum ada event</h3>
              <p className="text-gray-600 mb-6">Mulai kelola event Anda dengan membuat event pertama</p>
              <button
                onClick={() => router.push('/admin_ipnu/event/new')}
                className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all"
              >
                Buat Event Pertama
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusChip(event.statusAcara)}`}>
                      {event.statusAcara}
                    </span>
                    <p className="text-sm text-gray-500">
                      {new Date(event.jadwalAcara.tanggalMulai).toLocaleDateString('id-ID', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2 truncate">{event.namaAcara}</h3>
                  <p className="text-sm text-gray-600 mb-4">Dept: {event.departemen}</p>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Progres</span>
                        <span className="text-sm font-medium text-blue-700">{event.progresKeseluruhan}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${event.progresKeseluruhan}%` }}></div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
                    <button 
                      onClick={() => router.push(`/admin_ipnu/event/${event._id}`)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                      title="Lihat Detail Event"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => router.push(`/admin_ipnu/event/${event._id}/edit`)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                      title="Edit Event"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                     <button 
                      onClick={() => setDeleteModal({ show: true, eventId: event._id, eventName: event.namaAcara })}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                      title="Hapus Event"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDashboard;

