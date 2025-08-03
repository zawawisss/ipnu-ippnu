'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { IEvent } from '@/models/Event';
import { Icon } from '@iconify/react';
import { Button, Tooltip } from '@heroui/react';
import {
  Calendar,
  momentLocalizer,
  Views,
  ToolbarProps,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';

// --- Type Definition for Calendar ---
type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  resource: IEvent; // Original event data
};

// --- Custom Calendar Components (HeroUI Style) ---

const CustomToolbar = (toolbar: ToolbarProps<CalendarEvent>) => (
  <div className='flex items-center justify-between p-4'>
    <h2 className='text-xl font-bold text-gray-800 dark:text-white'>
      {toolbar.label}
    </h2>
    <div className='flex items-center gap-2'>
      <Button
        size='sm'
        variant='flat'
        onClick={() => toolbar.onNavigate('TODAY')}
      >
        Hari Ini
      </Button>
      <Button
        isIconOnly
        size='sm'
        variant='flat'
        onClick={() => toolbar.onNavigate('PREV')}
      >
        <Icon icon='mdi:chevron-left' />
      </Button>
      <Button
        isIconOnly
        size='sm'
        variant='flat'
        onClick={() => toolbar.onNavigate('NEXT')}
      >
        <Icon icon='mdi:chevron-right' />
      </Button>
    </div>
  </div>
);

const CustomEvent = ({ event }: { event: CalendarEvent }) => (
  <div className='p-1'>{event.title}</div>
);

// --- Re-usable Components ---

const EventCard = ({
  event,
  onShowDetail,
}: {
  event: IEvent;
  onShowDetail: (event: IEvent) => void;
}) => (
  <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1'>
    <div className='p-6'>
      <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-3 truncate'>
        {event.name}
      </h3>
      <div className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
        <p className='flex items-center'>
          <Icon icon='mdi:calendar' className='mr-2' />{' '}
          {new Date(event.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
          })}
        </p>
        <p className='flex items-center'>
          <Icon icon='mdi:clock-outline' className='mr-2' /> {event.time}
        </p>
        <p className='flex items-center'>
          <Icon icon='mdi:map-marker-outline' className='mr-2' />{' '}
          {event.location}
        </p>
      </div>
      <div className='mt-5'>
        <Button fullWidth onClick={() => onShowDetail(event)}>
          Lihat Detail & Daftar
        </Button>
      </div>
    </div>
  </div>
);

const RegistrationDetailModal = ({
  isOpen,
  onClose,
  event,
  onSubmit,
  error,
  success,
}: {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent | null;
  onSubmit: (name: string, org: 'ipnu' | 'ippnu') => void;
  error: string | null;
  success: string | null;
}) => {
  const [name, setName] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<'ipnu' | 'ippnu' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setSelectedOrg(null);
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedOrg) onSubmit(name.trim(), selectedOrg);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg'>
        <div className='flex justify-between items-start'>
          <h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>
            {event.name}
          </h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          >
            <Icon icon='mdi:close' className='text-2xl' />
          </button>
        </div>
        <div className='space-y-3 text-gray-700 dark:text-gray-300 mb-6'>
          <p className='flex items-center'>
            <Icon icon='mdi:calendar' className='mr-3 text-xl' />{' '}
            {new Date(event.date).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className='flex items-center'>
            <Icon icon='mdi:clock-outline' className='mr-3 text-xl' />{' '}
            {event.time}
          </p>
          <p className='flex items-center'>
            <Icon icon='mdi:map-marker-outline' className='mr-3 text-xl' />{' '}
            {event.location}
          </p>
          {event.delegation && (
            <p className='flex items-center pt-2 border-t border-gray-200 dark:border-gray-700 mt-3'>
              <Icon icon='mdi:account-group-outline' className='mr-3 text-xl' />{' '}
              <span className='font-semibold'>
                Delegasi: {event.delegation}
              </span>
            </p>
          )}
        </div>
        <div className='grid grid-cols-2 gap-6 mb-6'>
          <div>
            <h3 className='font-semibold text-blue-600 dark:text-blue-400 mb-2'>
              Peserta IPNU
            </h3>
            <ul className='space-y-1'>
              {event.ipnuAttendees.length > 0 ? (
                event.ipnuAttendees.map((attendee, i) => (
                  <li key={i} className='text-gray-600 dark:text-gray-400'>
                    {i + 1}. {attendee}
                  </li>
                ))
              ) : (
                <li className='text-gray-400 dark:text-gray-500'>-</li>
              )}
            </ul>
          </div>
          <div>
            <h3 className='font-semibold text-pink-600 dark:text-pink-400 mb-2'>
              Peserta IPPNU
            </h3>
            <ul className='space-y-1'>
              {event.ippnuAttendees.length > 0 ? (
                event.ippnuAttendees.map((attendee, i) => (
                  <li key={i} className='text-gray-600 dark:text-gray-400'>
                    {i + 1}. {attendee}
                  </li>
                ))
              ) : (
                <li className='text-gray-400 dark:text-gray-500'>-</li>
              )}
            </ul>
          </div>
        </div>
        {success ? (
          <div className='text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg'>
            <p className='font-semibold text-green-700 dark:text-green-300'>
              {success}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className='font-semibold mb-3 text-gray-800 dark:text-gray-200'>
              Daftar sebagai Peserta:
            </p>
            <div className='flex gap-4 mb-4'>
              <button
                type='button'
                onClick={() => setSelectedOrg('ipnu')}
                disabled={(event.ipnuAttendees?.length || 0) >= 2}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${selectedOrg === 'ipnu' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'} disabled:opacity-50`}
              >
                Daftar IPNU
              </button>
              <button
                type='button'
                onClick={() => setSelectedOrg('ippnu')}
                disabled={(event.ippnuAttendees?.length || 0) >= 2}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${selectedOrg === 'ippnu' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900' : 'border-gray-300 dark:border-gray-600'} disabled:opacity-50`}
              >
                Daftar IPPNU
              </button>
            </div>
            {selectedOrg && (
              <div className='mt-4'>
                <input
                  type='text'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder='Masukkan nama lengkap Anda'
                  className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md'
                  required
                />
                <button
                  type='submit'
                  className={`mt-4 w-full p-3 text-white font-bold rounded-lg ${selectedOrg === 'ipnu' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-600 hover:bg-pink-700'}`}
                >
                  Kirim Pendaftaran
                </button>
              </div>
            )}
            {error && <p className='text-red-500 mt-2 text-center'>{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'hybrid' | 'list'>('hybrid');
  const [listLimit, setListLimit] = useState(6);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  const localizer = momentLocalizer(moment);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Gagal mengambil data event');
      const data = await res.json();
      data.sort(
        (a: IEvent, b: IEvent) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const openModal = (event: IEvent) => {
    setSelectedEvent(event);
    setModalError(null);
    setModalSuccess(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const handleRegistrationSubmit = async (
    name: string,
    org: 'ipnu' | 'ippnu'
  ) => {
    if (!selectedEvent) return;
    setModalError(null);
    setModalSuccess(null);
    try {
      const res = await fetch(`/api/events/${selectedEvent._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, org }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal mendaftar');
      setModalSuccess(`Selamat, ${name}! Anda berhasil terdaftar.`);
      fetchEvents();
    } catch (err: any) {
      setModalError(err.message);
    }
  };

  const transformedEvents: CalendarEvent[] = useMemo(
    () =>
      events.map(event => ({
        title: event.name,
        start: new Date(event.date),
        end: new Date(event.date),
        resource: event,
      })),
    [events]
  );

  const upcomingEvents = useMemo(
    () => events.filter(e => new Date(e.date) >= new Date()),
    [events]
  );

  if (loading) return <div className='text-center p-10'>Memuat...</div>;
  if (error)
    return <div className='text-center p-10 text-red-500'>Error: {error}</div>;

  return (
    <div className='bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <div className='container mx-auto p-4 sm:p-6 lg:p-8'>
        <header className='text-center mb-8'>
          <h1 className='text-4xl font-extrabold text-gray-900 dark:text-white'>
            Kalender Kegiatan
          </h1>
          <p className='mt-2 text-lg text-gray-600 dark:text-gray-300'>
            Cari dan ikuti kegiatan IPNU-IPPNU di sekitarmu.
          </p>
        </header>

        <div className='flex justify-center mb-8'>
          <div className='inline-flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1'>
            <Tooltip content='Tampilan Kalender & Daftar'>
              <Button
                isIconOnly
                variant={viewMode === 'hybrid' ? 'solid' : 'light'}
                onClick={() => setViewMode('hybrid')}
              >
                <Icon icon='mdi:view-dashboard-outline' width='20' />
              </Button>
            </Tooltip>
            <Tooltip content='Tampilan Daftar Penuh'>
              <Button
                isIconOnly
                variant={viewMode === 'list' ? 'solid' : 'light'}
                onClick={() => setViewMode('list')}
              >
                <Icon icon='mdi:format-list-bulleted' width='20' />
              </Button>
            </Tooltip>
          </div>
        </div>

        {viewMode === 'hybrid' && (
          <div>
            <div className='bg-white dark:bg-gray-900 p-2 rounded-xl shadow-lg'>
              <Calendar<CalendarEvent>
                localizer={localizer}
                events={transformedEvents}
                onSelectEvent={event => openModal(event.resource)}
                views={[Views.MONTH]}
                components={{ toolbar: CustomToolbar, event: CustomEvent }}
                style={{ height: '50vh' }}
              />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-6'>
              Kegiatan Terdekat
            </h2>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {upcomingEvents.slice(0, listLimit).map(event => (
                <EventCard
                  key={event._id as string}
                  event={event}
                  onShowDetail={openModal}
                />
              ))}
            </div>
            {upcomingEvents.length > listLimit && (
              <div className='text-center mt-8'>
                <button
                  onClick={() => setListLimit(prev => prev + 6)}
                  className='px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600'
                >
                  Tampilkan Lebih Banyak
                </button>
              </div>
            )}
          </div>
        )}

        {viewMode === 'list' && (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {events.map(event => (
              <EventCard
                key={event._id as string}
                event={event}
                onShowDetail={openModal}
              />
            ))}
          </div>
        )}
      </div>

      <RegistrationDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        event={selectedEvent}
        onSubmit={handleRegistrationSubmit}
        error={modalError}
        success={modalSuccess}
      />
    </div>
  );
};

export default CalendarPage;
