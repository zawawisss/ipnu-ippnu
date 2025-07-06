'use client';

import React, { useState } from 'react';
import { IEvent } from '@/models/Event';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarDaysIcon, ClockIcon, MapPinIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';

interface EventListProps {
  events: IEvent[];
  onEdit: (event: IEvent) => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const EventList: React.FC<EventListProps> = ({ events, onEdit, onDelete }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus event ini?')) {
      setDeletingId(id);
      try {
        const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Gagal menghapus event');
        onDelete(id);
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Terjadi kesalahan saat menghapus event.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return 'Tanggal Tidak Valid';
    return format(dateObj, 'EEEE, dd MMMM yyyy', { locale: id });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">Daftar Event Organisasi</h2>
      {events.length === 0 ? (
        <div className="text-center py-10">
          <CalendarDaysIcon className="mx-auto h-20 w-20 text-gray-400 dark:text-gray-600" />
          <p className="mt-4 text-xl font-semibold text-gray-600 dark:text-gray-400">Belum ada event.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {events.map((event) => (
            <div key={event._id as string} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gray-50 dark:bg-gray-700/50 shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{event.delegation ? `Delegasi: ${event.delegation}` : ''}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="flat" onClick={() => onEdit(event)}><PencilSquareIcon className="h-5 w-5" /></Button>
                  <Button size="sm" variant="flat" color="danger" onClick={() => handleDelete(event._id as string)} isLoading={deletingId === event._id}><TrashIcon className="h-5 w-5" /></Button>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center"><CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-500" /><span>{formatDate(event.date.toString())}</span></div>
                <div className="flex items-center"><ClockIcon className="h-5 w-5 mr-2 text-green-500" /><span>{event.time}</span></div>
                <div className="flex items-center col-span-2"><MapPinIcon className="h-5 w-5 mr-2 text-red-500" /><span>{event.location}</span></div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Peserta</h4>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="font-medium text-blue-600 dark:text-blue-400">IPNU:</p>
                      <ul className="list-disc list-inside pl-2 text-xs text-gray-600 dark:text-gray-400">{(event.ipnuAttendees || []).length > 0 ? event.ipnuAttendees.map(name => <li key={name}>{name}</li>) : <li>-</li>}</ul>
                    </div>
                    <div>
                      <p className="font-medium text-pink-600 dark:text-pink-400">IPPNU:</p>
                      <ul className="list-disc list-inside pl-2 text-xs text-gray-600 dark:text-gray-400">{(event.ippnuAttendees || []).length > 0 ? event.ippnuAttendees.map(name => <li key={name}>{name}</li>) : <li>-</li>}</ul>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
