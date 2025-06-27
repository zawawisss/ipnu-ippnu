'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface EventFormProps {
  initialData?: {
    _id?: string;
    name: string;
    date: string; // Format YYYY-MM-DD for input type="date"
    time: string;
    location: string;
    ipnuAttendees: string[];
    ippnuAttendees: string[];
  };
  onSave: (event: any) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [ipnuAttendees, setIpnuAttendees] = useState(initialData?.ipnuAttendees.join(', ') || '');
  const [ippnuAttendees, setIppnuAttendees] = useState(initialData?.ippnuAttendees.join(', ') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      // Format date to YYYY-MM-DD for input type="date"
      const formattedDate = new Date(initialData.date).toISOString().split('T')[0];
      setDate(formattedDate);
      setTime(initialData.time);
      setLocation(initialData.location);
      setIpnuAttendees(initialData.ipnuAttendees.join(', '));
      setIppnuAttendees(initialData.ippnuAttendees.join(', '));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Convert comma-separated strings to arrays
    const ipnuArray = ipnuAttendees.split(',').map(s => s.trim()).filter(s => s);
    const ippnuArray = ippnuAttendees.split(',').map(s => s.trim()).filter(s => s);

    const eventData = {
      name,
      date,
      time,
      location,
      ipnuAttendees: ipnuArray,
      ippnuAttendees: ippnuArray,
    };

    try {
      const method = initialData?._id ? 'PUT' : 'POST';
      const url = initialData?._id ? `/api/events/${initialData._id}` : '/api/events';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal menyimpan event');
      }

      const savedEvent = await res.json();
      onSave(savedEvent);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{initialData ? 'Edit Event' : 'Tambah Event Baru'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Acara</label>
          <input
            type="text"
            id="name"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</label>
            <input
              type="date"
              id="date"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Waktu</label>
            <input
              type="text"
              id="time"
              placeholder="Ex: 13.30 - selesai"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lokasi</label>
          <input
            type="text"
            id="location"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="ipnuAttendees" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peserta IPNU (pisahkan dengan koma)</label>
          <textarea
            id="ipnuAttendees"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={ipnuAttendees}
            onChange={(e) => setIpnuAttendees(e.target.value)}
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="ippnuAttendees" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peserta IPPNU (pisahkan dengan koma)</label>
          <textarea
            id="ippnuAttendees"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={ippnuAttendees}
            onChange={(e) => setIppnuAttendees(e.target.value)}
          ></textarea>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;

