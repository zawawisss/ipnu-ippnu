'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';

interface MakestaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
  mode: 'create' | 'edit';
}

// Function to convert JavaScript Date to Excel serial date
function jsDateToExcelSerial(date: Date): number {
  const daysSinceEpoch = Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
  return daysSinceEpoch + 25569; // Add days from 1900-01-01 to 1970-01-01
}

// Function to convert Excel serial date to JavaScript Date
function excelSerialToJSDate(serial: number): Date {
  const daysSinceEpoch = serial - 25569;
  const ms = daysSinceEpoch * 24 * 60 * 60 * 1000;
  return new Date(ms);
}

// Function to format date for input
function formatDateForInput(serial: number): string {
  if (!serial) return '';
  const date = excelSerialToJSDate(serial);
  return date.toISOString().split('T')[0];
}

const MakestaForm: React.FC<MakestaFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editData,
  mode,
}) => {
  const [formData, setFormData] = useState({
    organisasi: 'IPNU',
    TANGGAL: '',
    PENGKADERAN: 'MAKESTA',
    PIMPINAN: '',
    TEMPAT: '',
    JUMLAH: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && editData) {
      setFormData({
        organisasi: editData.organisasi || 'IPNU',
        TANGGAL: formatDateForInput(editData.TANGGAL),
        PENGKADERAN: editData.PENGKADERAN || 'MAKESTA',
        PIMPINAN: editData.PIMPINAN || '',
        TEMPAT: editData.TEMPAT || '',
        JUMLAH: editData.JUMLAH?.toString() || '',
      });
    } else {
      // Reset form for create mode
      setFormData({
        organisasi: 'IPNU',
        TANGGAL: '',
        PENGKADERAN: 'MAKESTA',
        PIMPINAN: '',
        TEMPAT: '',
        JUMLAH: '',
      });
    }
  }, [mode, editData, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validate required fields
      if (
        !formData.TANGGAL ||
        !formData.PIMPINAN ||
        !formData.TEMPAT ||
        !formData.JUMLAH
      ) {
        alert('Semua field harus diisi!');
        return;
      }

      // Validate jumlah is a positive number
      const jumlahValue = parseInt(formData.JUMLAH);
      if (isNaN(jumlahValue) || jumlahValue <= 0) {
        alert('Jumlah peserta harus berupa angka yang valid dan lebih dari 0!');
        return;
      }

      // Convert date to Excel serial
      const dateValue = new Date(formData.TANGGAL);
      if (isNaN(dateValue.getTime())) {
        alert('Tanggal tidak valid!');
        return;
      }
      const excelSerial = jsDateToExcelSerial(dateValue);

      const payload = {
        organisasi: formData.organisasi,
        TANGGAL: excelSerial,
        PENGKADERAN: formData.PENGKADERAN.trim(),
        PIMPINAN: formData.PIMPINAN.trim(),
        TEMPAT: formData.TEMPAT.trim(),
        JUMLAH: jumlahValue,
      };

      let response;
      if (mode === 'create') {
        response = await fetch('/api/makesta', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/makesta', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: editData._id,
            ...payload,
          }),
        });
      }

      if (response.ok) {
        alert(
          mode === 'create'
            ? 'Data berhasil ditambahkan!'
            : 'Data berhasil diperbarui!'
        );
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='2xl'>
      <ModalContent>
        <ModalHeader>
          {mode === 'create' ? 'Tambah Data MAKESTA' : 'Edit Data MAKESTA'}
        </ModalHeader>
        <ModalBody>
          <div className='flex flex-col gap-4'>
            <Select
              label='Organisasi'
              selectedKeys={[formData.organisasi]}
              onSelectionChange={keys => {
                const value = Array.from(keys)[0] as string;
                handleInputChange('organisasi', value);
              }}
            >
              <SelectItem key='IPNU'>IPNU</SelectItem>
              <SelectItem key='IPPNU'>IPPNU</SelectItem>
            </Select>

            <Input
              type='date'
              label='Tanggal'
              value={formData.TANGGAL}
              onChange={e => handleInputChange('TANGGAL', e.target.value)}
              isRequired
            />

            <Input
              label='Jenis Pengkaderan'
              value={formData.PENGKADERAN}
              onChange={e => handleInputChange('PENGKADERAN', e.target.value)}
              isRequired
            />

            <Input
              label='Pimpinan'
              placeholder='contoh: PAC IPNU Babadan'
              value={formData.PIMPINAN}
              onChange={e => handleInputChange('PIMPINAN', e.target.value)}
              isRequired
            />

            <Input
              label='Tempat'
              placeholder='contoh: Gedung Serbaguna Babadan'
              value={formData.TEMPAT}
              onChange={e => handleInputChange('TEMPAT', e.target.value)}
              isRequired
            />

            <Input
              type='number'
              label='Jumlah Peserta'
              value={formData.JUMLAH}
              onChange={e => handleInputChange('JUMLAH', e.target.value)}
              isRequired
              min='1'
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='danger'
            variant='light'
            onPress={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button color='primary' onPress={handleSubmit} isLoading={isLoading}>
            {mode === 'create' ? 'Tambah' : 'Simpan'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MakestaForm;
