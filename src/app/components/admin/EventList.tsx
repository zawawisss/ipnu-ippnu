'use client';

import React, { useState } from 'react';
import { IEvent } from '@/models/Event'; // Import interface Event
import { format } from 'date-fns';
import { id } from 'date-fns/locale'; // Import locale Bahasa Indonesia

interface EventListProps {
  events: IEvent[];
  onEdit: (event: IEvent) => void;
  onDelete: (id: string) => void;
}

const EventList: React.FC<EventListProps> = ({ events, onEdit, onDelete }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fungsi untuk menangani penghapusan event
  const handleDelete = async (id: string) => {
    // Menampilkan konfirmasi kepada pengguna sebelum menghapus
    if (window.confirm('Apakah Anda yakin ingin menghapus event ini?')) {
      setDeletingId(id); // Set ID event yang sedang dihapus untuk menampilkan status loading
      try {
        const res = await fetch(`/api/events/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          // Jika respons tidak OK, lempar error
          throw new Error('Gagal menghapus event');
        }
        onDelete(id); // Panggil callback onDelete untuk memperbarui daftar di komponen induk
      } catch (error) {
        console.error('Error deleting event:', error);
        // Menampilkan pesan error jika terjadi masalah
        alert('Terjadi kesalahan saat menghapus event.');
      } finally {
        setDeletingId(null); // Reset status loading setelah operasi selesai
      }
    }
  };

  // Helper untuk memformat tanggal ke format Bahasa Indonesia
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, dd MMMM yyyy', { locale: id });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Daftar Event Organisasi</h2>
      {events.length === 0 ? (
        // Tampilkan pesan jika tidak ada event
        <p className="text-gray-600 dark:text-gray-400">Belum ada event yang dijadwalkan.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            // Menggunakan event._id sebagai key, memastikan tipenya adalah string
            <div key={event._id as string} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{event.name}</h3>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">🗓 Tanggal:</span> {formatDate(event.date.toString())}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">⏰ Waktu:</span> {event.time}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">📍 Lokasi:</span> {event.location}
              </p>
              {event.ipnuAttendees && event.ipnuAttendees.length > 0 && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">IPNU:</span> {event.ipnuAttendees.join(', ')}
                </p>
              )}
              {event.ippnuAttendees && event.ippnuAttendees.length > 0 && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">IPPNU:</span> {event.ippnuAttendees.join(', ')}
                </p>
              )}
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => onEdit(event)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event._id as string)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-sm"
                  disabled={deletingId === event._id}
                >
                  {deletingId === event._id ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;

