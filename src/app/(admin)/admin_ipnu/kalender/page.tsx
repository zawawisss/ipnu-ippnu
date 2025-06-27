'use client';

import React, { useEffect, useState, useCallback } from 'react';
import EventForm from '@/app/components/admin/EventForm';
import EventList from '@/app/components/admin/EventList';
import { IEvent } from '@/models/Event'; // Import interface Event

const AdminCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);

  // Fungsi untuk mengambil data event dari API
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/events');
      if (!res.ok) {
        throw new Error('Gagal mengambil data event');
      }
      const data = await res.json();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat event.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handler saat event berhasil disimpan (baik tambah baru atau update)
  const handleEventSaved = (savedEvent: IEvent) => {
    setShowForm(false);
    setEditingEvent(null);
    fetchEvents(); // Muat ulang event untuk menampilkan data terbaru
  };

  // Handler saat tombol edit diklik
  const handleEditEvent = (event: IEvent) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  // Handler saat event dihapus
  const handleEventDeleted = (deletedId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event._id !== deletedId));
  };

  // Handler saat membatalkan form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p>Memuat kalender...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Kalender Organisasi IPNU IPPNU</h1>

      <button
        onClick={() => {
          setEditingEvent(null);
          setShowForm(true);
        }}
        className="mb-6 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        Tambah Event Baru
      </button>

      {showForm && (
        <div className="mb-8">
                    <EventForm
            initialData={
              editingEvent
                ? {
                    ...editingEvent,
                    _id: editingEvent._id as string, // Ensure _id is string
                    date:
                      typeof editingEvent.date === 'string'
                        ? editingEvent.date
                        : editingEvent.date instanceof Date
                        ? editingEvent.date.toISOString().slice(0, 10)
                        : '',
                  }
                : undefined
            }
            onSave={handleEventSaved}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <EventList events={events} onEdit={handleEditEvent} onDelete={handleEventDeleted} />
    </div>
  );
};

export default AdminCalendarPage;

