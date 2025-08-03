'use client';

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectItem,
  Button,
  Input,
  Textarea,
  Tabs,
  Tab,
  Card,
  CardBody,
} from '@heroui/react';
import { Icon } from '@iconify/react';

interface EventFormProps {
  initialData?: {
    _id?: string;
    name: string;
    date: string;
    time: string;
    location: string;
    delegation?: string;
    ipnuAttendees: string[];
    ippnuAttendees: string[];
  };
  onSave: (event: any) => void;
  onCancel: () => void;
}

const DELEGATION_OPTIONS = [
  'Departemen Organisasi',
  'Departemen Kaderisasi',
  'Departemen Pengembangan Komisariat',
  'Departemen Dakwah dan Jaringan Pesantren',
  'Departemen Olahraga, Seni dan Budaya',
  'Lembaga Corps Brigade Pembangunan (CBP)',
  'Lembaga Pers dan Penerbitan (LPP)',
  'Lembaga Ekonomi Kewirausahaan dan Koperasi (LEKAS)',
  'Lembaga Komunikasi Perguruan Tinggi (LKPT)',
  'Badan Student Crisis Centre (BSCC)',
  'Badan Student Research Center (SRC/TMRC)',
  'Pengurus Harian',
];

const AttendeeInput = ({
  title,
  attendees,
  setAttendees,
}: {
  title: string;
  attendees: string[];
  setAttendees: (attendees: string[]) => void;
}) => {
  const [currentName, setCurrentName] = useState('');

  const handleAdd = () => {
    if (currentName.trim() && !attendees.includes(currentName.trim())) {
      setAttendees([...attendees, currentName.trim()]);
      setCurrentName('');
    }
  };

  const handleRemove = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
        {title}
      </label>
      <div className='flex items-center gap-2'>
        <Input
          placeholder='Masukkan nama'
          value={currentName}
          onChange={e => setCurrentName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button type='button' isIconOnly onClick={handleAdd}>
          <Icon icon='mdi:plus' />
        </Button>
      </div>
      <div className='mt-2 space-y-2'>
        {attendees.map((name, index) => (
          <div
            key={index}
            className='flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-md'
          >
            <span className='text-sm'>{name}</span>
            <Button
              type='button'
              size='sm'
              isIconOnly
              variant='light'
              onClick={() => handleRemove(index)}
            >
              <Icon icon='mdi:close' />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [delegation, setDelegation] = useState<string>('');
  const [ipnuAttendees, setIpnuAttendees] = useState<string[]>([]);
  const [ippnuAttendees, setIppnuAttendees] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDate(
        initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : ''
      );
      setTime(initialData.time || '');
      setLocation(initialData.location || '');
      setDelegation(initialData.delegation || '');
      setIpnuAttendees(initialData.ipnuAttendees || []);
      setIppnuAttendees(initialData.ippnuAttendees || []);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const eventData = {
      name,
      date,
      time,
      location,
      delegation,
      ipnuAttendees,
      ippnuAttendees,
    };

    try {
      const method = initialData?._id ? 'PUT' : 'POST';
      const url = initialData?._id
        ? `/api/events/${initialData._id}`
        : '/api/events';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal menyimpan event');
      }
      onSave(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-6 text-gray-900 dark:text-white'>
        {initialData?._id ? 'Edit Event' : 'Tambah Event Baru'}
      </h2>
      <form onSubmit={handleSubmit}>
        <Tabs aria-label='Form Event'>
          <Tab key='detail' title='Detail Acara'>
            <Card>
              <CardBody className='space-y-6 p-4'>
                <Input
                  label='Nama Acara'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  isRequired
                />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Input
                    type='date'
                    label='Tanggal'
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    isRequired
                  />
                  <Input
                    label='Waktu'
                    placeholder='Contoh: 13.30 - Selesai'
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    isRequired
                  />
                </div>
                <Input
                  label='Lokasi'
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  isRequired
                />
                <Select
                  label='Pendelegasian'
                  placeholder='Pilih delegasi'
                  selectedKeys={delegation ? [delegation] : []}
                  onSelectionChange={keys =>
                    setDelegation(Array.from(keys)[0] as string)
                  }
                  isRequired
                >
                  {DELEGATION_OPTIONS.map(item => (
                    <SelectItem key={item}>{item}</SelectItem>
                  ))}
                </Select>
              </CardBody>
            </Card>
          </Tab>
          <Tab key='kehadiran' title='Kehadiran (Opsional)'>
            <Card>
              <CardBody className='space-y-6 p-4'>
                <AttendeeInput
                  title='Kehadiran IPNU'
                  attendees={ipnuAttendees}
                  setAttendees={setIpnuAttendees}
                />
                <AttendeeInput
                  title='Kehadiran IPPNU'
                  attendees={ippnuAttendees}
                  setAttendees={setIppnuAttendees}
                />
              </CardBody>
            </Card>
          </Tab>
        </Tabs>

        {error && (
          <p className='text-red-500 text-sm text-center mt-4'>{error}</p>
        )}
        <div className='flex justify-end space-x-4 pt-6'>
          <Button
            type='button'
            variant='flat'
            onClick={onCancel}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type='submit' color='primary' isLoading={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
