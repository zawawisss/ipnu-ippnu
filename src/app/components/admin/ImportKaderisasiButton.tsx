'use client';

import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Alert,
} from '@heroui/react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface ImportKaderisasiButtonProps {
  organization: 'IPNU' | 'IPPNU';
  onImportComplete?: () => void;
}

const ImportKaderisasiButton: React.FC<ImportKaderisasiButtonProps> = ({
  organization,
  onImportComplete,
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setImportStatus({
        type: 'error',
        message: 'Silakan pilih file Excel terlebih dahulu',
      });
      return;
    }

    setIsImporting(true);
    setImportStatus({ type: 'info', message: 'Memproses file Excel...' });

    try {
      // In a real implementation, you would upload the file and process it server-side
      // For now, we'll simulate the import process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setImportStatus({
        type: 'success',
        message: `Data ${organization} berhasil diimpor! Silakan refresh halaman untuk melihat data baru.`,
      });

      // Call the callback to refresh the data
      if (onImportComplete) {
        onImportComplete();
      }

      setTimeout(() => {
        onOpenChange();
        setImportStatus(null);
        setFile(null);
      }, 3000);
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'Terjadi kesalahan saat mengimpor data. Silakan coba lagi.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Button
        color='secondary'
        variant='flat'
        onPress={onOpen}
        startContent={<ArrowUpTrayIcon className='w-4 h-4' />}
      >
        Import Excel
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='2xl'>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>Import Data Kaderisasi {organization}</ModalHeader>
              <ModalBody>
                {importStatus && (
                  <Alert
                    color={
                      importStatus.type === 'success'
                        ? 'success'
                        : importStatus.type === 'error'
                          ? 'danger'
                          : 'primary'
                    }
                    className='mb-4'
                  >
                    {importStatus.message}
                  </Alert>
                )}

                <div className='space-y-4'>
                  <div>
                    <h4 className='text-lg font-semibold mb-2'>
                      Panduan Import:
                    </h4>
                    <ul className='text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                      <li>• File harus berformat Excel (.xlsx)</li>
                      <li>
                        • Sheet yang akan diproses: "DATA KADERISASI{' '}
                        {organization}"
                      </li>
                      <li>
                        • Kolom yang diperlukan: TANGGAL, PENGKADERAN, PIMPINAN,
                        TEMPAT, JUMLAH
                      </li>
                      <li>
                        • Data akan dikonversi menjadi data kader individual
                      </li>
                    </ul>
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Pilih File Excel:
                    </label>
                    <input
                      type='file'
                      accept='.xlsx,.xls'
                      onChange={handleFileChange}
                      className='block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:outline-none'
                      disabled={isImporting}
                    />
                  </div>

                  {file && (
                    <div className='p-3 bg-gray-100 dark:bg-gray-800 rounded-lg'>
                      <p className='text-sm'>
                        <strong>File terpilih:</strong> {file.name}
                      </p>
                      <p className='text-xs text-gray-600 dark:text-gray-400'>
                        Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color='danger'
                  variant='light'
                  onPress={onClose}
                  disabled={isImporting}
                >
                  Batal
                </Button>
                <Button
                  color='primary'
                  onPress={handleImport}
                  isLoading={isImporting}
                  disabled={!file || isImporting}
                >
                  {isImporting ? 'Mengimpor...' : 'Import Data'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ImportKaderisasiButton;
