"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

// Extend the Session type to include the role property
declare module 'next-auth' {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string; // Add the role property
    };
  }
}
import { Alert } from "@heroui/alert";
import SuratTugasPreviewModal from '@/app/components/admin/SuratTugasPreviewModal';

interface Assignee {
  nama: string;
  tempatTanggalLahir: string;
  jabatan: string;
  alamat: string;
}

interface SuratTugas {
  _id: string;
  assignees: Assignee[];
  kegiatan: string;
  penyelenggara: string;
  tempat: string;
  tanggalKegiatan: string;
  status: 'pending' | 'approved_ketua' | 'approved_sekretaris' | 'approved_all';
  createdAt: string;
}

export default function SuratTugasApprovalPage() {
  const { data: session } = useSession();
  const [pendingSuratTugas, setPendingSuratTugas] = useState<SuratTugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const [alert, setAlert] = useState<{ type: 'success' | 'danger' | null, message: string | null }>(
    { type: null, message: null }
  );
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewLetterData, setPreviewLetterData] = useState<SuratTugas | null>(null);

  const closeAlert = () => {
    setAlert({ type: null, message: null });
  };

  useEffect(() => {
    const fetchPendingSuratTugas = async () => {
      if (!session?.user?.role) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/surat-tugas/pending');
        if (!response.ok) {
          throw new Error(`Error fetching pending surat tugas: ${response.statusText}`);
        }
        const data = await response.json();
        setPendingSuratTugas(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingSuratTugas();
  }, [session]);

  const handleApprove = async (letterId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/surat-tugas/${letterId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve surat tugas');
      }

      setPendingSuratTugas(prev => prev.filter(letter => letter._id !== letterId));
      setAlert({ type: 'success', message: 'Surat Tugas berhasil disetujui!' });
    } catch (err: any) {
      setError(err.message);
      setAlert({ type: 'danger', message: `Error approving surat tugas: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

    const handlePreview = async (letterId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/surat-tugas/${letterId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch surat tugas for preview');
      }
      const letterData = await response.json();
      setPreviewLetterData(letterData);
      setIsPreviewModalOpen(true);
    } catch (err: any) {
      setError(err.message);
       setAlert({ type: 'danger', message: `Error fetching preview: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewLetterData(null);
  };

  if (loading) {
    return <div>Loading pending surat tugas...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!session) {
    return <div>Please login to view pending surat tugas.</div>;
  }

  // Determine if the current user is a Ketua or Sekretaris
  const isKetua = session.user?.role === 'ketua';
  const isSekretaris = session.user?.role === 'sekretaris';

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Surat Tugas Menunggu Persetujuan</h1>
       {alert.message && alert.type && (
        <Alert
          color={alert.type === 'success' ? 'success' : 'danger'}
          title={alert.message}
          onClose={closeAlert}
          className="fixed top-1rem right-1rem z-50" // Add floating style
        />
      )}

      {pendingSuratTugas.length === 0 ? (
        <p>Tidak ada surat tugas yang menunggu persetujuan.</p>
      ) : (
        <div className="space-y-4">
          {pendingSuratTugas.map((letter) => (
            <div key={letter._id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">{letter.kegiatan}</h2>
              <p><strong>Penyelenggara:</strong> {letter.penyelenggara}</p>
              <p><strong>Tempat:</strong> {letter.tempat}</p>
              <p><strong>Tanggal Kegiatan:</strong> {letter.tanggalKegiatan}</p>
              <p><strong>Status:</strong> {letter.status}</p>
              <div className="mt-2">
                <strong>Penerima Tugas:</strong>
                <ul className="list-disc list-inside">
                  {letter.assignees.map((assignee, index) => (
                    <li key={index}>{assignee.nama} ({assignee.jabatan})</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 space-x-2">
                 <button
                    onClick={() => handlePreview(letter._id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Preview
                  </button>
                {isKetua && letter.status === 'pending' && (
                  <button
                    onClick={() => handleApprove(letter._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Setujui (Ketua)
                  </button>
                )}
                {isSekretaris && letter.status === 'approved_ketua' && (
                  <button
                    onClick={() => handleApprove(letter._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Setujui (Sekretaris)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
       <SuratTugasPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={closePreviewModal}
        letterData={previewLetterData}
      />
    </div>
  );
}
