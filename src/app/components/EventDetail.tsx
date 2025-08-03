
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, UserCircleIcon, CheckCircleIcon, ClockIcon, CurrencyDollarIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import InteractiveChecklist from './InteractiveChecklist';
import BudgetTracker from './BudgetTracker';
import CommitteeManager from './CommitteeManager';
import EditableText from './EditableText';

// This is a placeholder type. We will fetch real data.
interface Event {
  _id: string;
  namaAcara: string;
  departemen: string;
  statusAcara: string;
  jadwalAcara: {
    tanggalMulai: string;
    tanggalSelesai: string;
    jamMulai: string;
    jamSelesai: string;
    tempatAcara: {
      nama: string;
    };
  };
  penanggungJawab: {
    nama: string;
  };
  progresKeseluruhan?: number;
  daftarKebutuhan: any[];
  tugasPanitia: any[];
  anggaranProgres: {
    totalAnggaranRencana: number;
    totalRealisasi: number;
  };
}

// Dummy data for initial layout
const dummyEvent: Event = {
  _id: '1',
  namaAcara: 'Loading Event Details...',
  departemen: 'Loading...',
  statusAcara: 'Draft',
  jadwalAcara: {
    tanggalMulai: new Date().toISOString(),
    tanggalSelesai: new Date().toISOString(),
    jamMulai: '00:00',
    jamSelesai: '00:00',
    tempatAcara: {
      nama: 'Loading...',
    },
  },
  penanggungJawab: {
    nama: 'Loading...',
  },
  progresKeseluruhan: 50,
  daftarKebutuhan: [],
  tugasPanitia: [],
  anggaranProgres: {
    totalAnggaranRencana: 5000000,
    totalRealisasi: 2500000,
  },
};


const EventDetail = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [event, setEvent] = useState<Event>(dummyEvent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/progres-laporan-acara/${id}`);
        if (!response.ok) {
          throw new Error('Gagal mengambil detail event.');
        }
        const data = await response.json();
        if (data.success) {
          setEvent(data.data);
        } else {
          throw new Error(data.error || 'Event tidak ditemukan.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Persiapan': return 'bg-yellow-100 text-yellow-800';
      case 'Pelaksanaan': return 'bg-blue-100 text-blue-800';
      case 'Selesai': return 'bg-green-100 text-green-800';
      case 'Dibatalkan': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [committeeMembers, setCommitteeMembers] = useState<any[]>([]);

  useEffect(() => {
    // Convert tugasPanitia to checklist format
    if (event.tugasPanitia.length > 0) {
      const tasks = event.tugasPanitia.flatMap(p => 
        p.daftarTugas?.map((t: any) => ({
          id: t._id || t.id || Date.now().toString(),
          text: t.tugas,
          completed: t.status === 'Selesai',
          description: t.catatan || '',
          expanded: false
        })) || []
      );
      setChecklistItems(tasks);
    }

    // Extract committee members from event data
    if ((event as any)?.daftarPanitia) {
      setCommitteeMembers((event as any).daftarPanitia);
    }
  }, [event]);

  const handleChecklistChange = (updatedItems: any[]) => {
    setChecklistItems(updatedItems);
    // Auto-save will be handled by InteractiveChecklist component
  };

  const handleUpdateBudget = async (updatedBudgetItems: any[]) => {
    try {
      const totalRencana = updatedBudgetItems.reduce((acc, item) => acc + item.anggaranRencana, 0);
      const totalRealisasi = updatedBudgetItems.reduce((acc, item) => acc + item.realisasi, 0);

      const updatedEvent = {
        ...event,
        anggaranProgres: {
          totalAnggaranRencana: totalRencana,
          totalRealisasi: totalRealisasi,
          rincianBiaya: updatedBudgetItems,
        }
      };

      setEvent(updatedEvent);

      // Save to database
      const response = await fetch(`/api/progres-laporan-acara/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan perubahan anggaran');
      }
    } catch (err: any) {
      console.error('Error updating budget:', err);
      setError(err.message);
    }
  };

  const handleUpdateCommittee = async (updatedMembers: any[]) => {
    try {
      const updatedEvent = {
        ...event,
        daftarPanitia: updatedMembers,
      };

      setEvent(updatedEvent);

      // Save to database
      const response = await fetch(`/api/progres-laporan-acara/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan perubahan panitia');
      }
    } catch (err: any) {
      console.error('Error updating committee:', err);
      setError(err.message);
    }
  };

  const handleUpdateEventTitle = async (newTitle: string) => {
    try {
      const updatedEvent = {
        ...event,
        namaAcara: newTitle,
      };

      setEvent(updatedEvent);

      // Save to database
      const response = await fetch(`/api/progres-laporan-acara/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan perubahan nama acara');
      }
    } catch (err: any) {
      console.error('Error updating event title:', err);
      setError(err.message);
    }
  };

  const handleUpdateEventDepartment = async (newDepartment: string) => {
    try {
      const updatedEvent = {
        ...event,
        departemen: newDepartment,
      };

      setEvent(updatedEvent);

      // Save to database
      const response = await fetch(`/api/progres-laporan-acara/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan perubahan departemen');
      }
    } catch (err: any) {
      console.error('Error updating department:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading event details...</div>;
  }
  
  if (error) {
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.push('/admin_ipnu/event')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold">
          <ArrowLeftIcon className="h-5 w-5" />
          Kembali ke Dashboard
        </button>

        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="flex justify-between items-start">
            <span className={`text-sm font-semibold px-4 py-1.5 rounded-full ${getStatusChip(event.statusAcara)}`}>
              {event.statusAcara}
            </span>
            {/* Edit button removed for inline editing */}
          </div>
          <EditableText 
            value={event.namaAcara}
            onChange={handleUpdateEventTitle}
            className="text-3xl font-bold text-gray-800 mt-4"
            inputClassName="text-3xl font-bold text-gray-800 mt-4 p-1 rounded border border-blue-400"
          />
          <EditableText 
            value={event.departemen}
            onChange={handleUpdateEventDepartment}
            className="text-gray-600"
            inputClassName="text-gray-600 p-1 rounded border border-blue-400"
            placeholder="Departemen..."
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-400"/>
              <span>{new Date(event.jadwalAcara.tanggalMulai).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-gray-400"/>
              <span>{event.jadwalAcara.tempatAcara.nama}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCircleIcon className="h-5 w-5 text-gray-400"/>
              <span>PJ: {event.penanggungJawab.nama}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <InteractiveChecklist
              title="Checklist Tugas"
              icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />}
              items={checklistItems}
              onItemsChange={handleChecklistChange}
              eventId={event._id}
              committeeMembers={committeeMembers}
            />
             <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><DocumentTextIcon className="h-6 w-6 text-indigo-500" /> Catatan & Log</h2>
                <p className="text-gray-600">Belum ada catatan.</p>
                {/* Notes/logs will go here */}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
              <BudgetTracker 
                eventId={event._id}
                initialBudgetItems={(event.anggaranProgres as any)?.rincianBiaya || []}
                onSaveChanges={handleUpdateBudget}
              />
              <CommitteeManager 
                eventId={event._id}
                initialMembers={(event as any)?.daftarPanitia || []}
                onSaveChanges={handleUpdateCommittee}
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;

