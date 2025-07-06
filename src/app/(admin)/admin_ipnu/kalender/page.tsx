'use client';

import React, { useEffect, useState, useCallback } from 'react';
import EventForm from '@/app/components/admin/EventForm';
import EventList from '@/app/components/admin/EventList';
import { IEvent } from '@/models/Event';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@heroui/react';
import { Calendar } from '@heroui/react';
import { getLocalTimeZone, today } from '@internationalized/date';
import type { DateValue } from '@react-types/datepicker';

const AdminCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);

  const { isOpen: isCalendarOpen, onOpen: onCalendarOpen, onOpenChange: onCalendarOpenChange } = useDisclosure();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onOpenChange: onFormOpenChange } = useDisclosure();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Gagal mengambil data event');
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

  const handleEventSaved = () => {
    onFormOpenChange(); // Close form modal
    setEditingEvent(null);
    fetchEvents();
  };

  const handleEditEvent = (event: IEvent) => {
    setEditingEvent(event);
    onFormOpen();
  };

  const handleEventDeleted = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event._id !== id));
  };
  
  const handleDateSelect = (date: any) => {
    setEditingEvent(null);
    const newEvent: Partial<IEvent> = {
        name: '',
        date: new Date(date.toString()),
        time: '',
        location: '',
        delegation: '',
        ipnuAttendees: [],
        ippnuAttendees: [],
    };
    setEditingEvent(newEvent as IEvent);
    onCalendarOpenChange(); // Close calendar modal
    onFormOpen(); // Open form modal
  };

  const handleCancelForm = () => {
    onFormOpenChange();
    setEditingEvent(null);
  };

  const handleOpenAddNew = () => {
      setEditingEvent(null);
      onCalendarOpen();
  }

  if (loading) return <div className="text-center p-10">Memuat...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Kalender Organisasi</h1>

      <Button color="primary" onPress={handleOpenAddNew} className="mb-6">
        Tambah Event Baru
      </Button>

      {/* Calendar Picker Modal */}
      <Modal isOpen={isCalendarOpen} onOpenChange={onCalendarOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Pilih Tanggal Acara</ModalHeader>
              <ModalBody>
                <Calendar 
                  aria-label="Pilih Tanggal"
                  onChange={handleDateSelect}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Event Form Modal */}
      <Modal isOpen={isFormOpen} onOpenChange={onFormOpenChange} size="3xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
             <EventForm
                initialData={editingEvent ? {
                    ...editingEvent,
                    _id: editingEvent._id?.toString(),
                    date: new Date(editingEvent.date).toISOString().slice(0, 10),
                } : undefined}
                onSave={handleEventSaved}
                onCancel={handleCancelForm}
              />
          )}
        </ModalContent>
      </Modal>

      <EventList events={events} onEdit={handleEditEvent} onDelete={handleEventDeleted} onUpdate={fetchEvents} />
    </div>
  );
};

export default AdminCalendarPage;
