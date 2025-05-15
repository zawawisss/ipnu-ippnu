"use client";

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Assignee {
  nama: string;
  tempatTanggalLahir: string;
  jabatan: string;
  alamat: string;
}

interface SuratTugasData {
  _id: string;
  assignees: Assignee[];
  kegiatan: string;
  penyelenggara: string;
  tempat: string;
  tanggalKegiatan: string;
  status: 'pending' | 'approved_ketua' | 'approved_sekretaris' | 'approved_all';
  createdAt: string;
}

interface SuratTugasPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterData: SuratTugasData | null;
}

export default function SuratTugasPreviewModal({ isOpen, onClose, letterData }: SuratTugasPreviewModalProps) {
  if (!isOpen || !letterData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-gray-200">Preview Surat Tugas</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="dark:text-gray-200">
          <h3 className="text-lg font-bold mb-2">{letterData.kegiatan}</h3>
          <p><strong>Penyelenggara:</strong> {letterData.penyelenggara}</p>
          <p><strong>Tempat:</strong> {letterData.tempat}</p>
          <p><strong>Tanggal Kegiatan:</strong> {letterData.tanggalKegiatan}</p>
          <p><strong>Status:</strong> {letterData.status}</p>

          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">Penerima Tugas:</h4>
            <ul className="list-disc list-inside">
              {letterData.assignees.map((assignee, index) => (
                <li key={index}>
                  <strong>Nama:</strong> {assignee.nama}, <strong>TTL:</strong> {assignee.tempatTanggalLahir}, <strong>Jabatan:</strong> {assignee.jabatan}, <strong>Alamat:</strong> {assignee.alamat}
                </li>
              ))}
            </ul>
          </div>
          {/* Add more fields as needed for preview */}
        </div>
      </div>
    </div>
  );
}
