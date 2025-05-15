"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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

export default function ApprovedSuratTugasPage() {
  const { data: session } = useSession();
  const [approvedSuratTugas, setApprovedSuratTugas] = useState<SuratTugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApprovedSuratTugas = async () => {
      if (!session) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/surat-tugas/approved');
        if (!response.ok) {
          throw new Error(`Error fetching approved surat tugas: ${response.statusText}`);
        }
        const data = await response.json();
        setApprovedSuratTugas(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedSuratTugas();
  }, [session]);

  const handlePrint = async (letterId: string) => {
    setLoading(true); // Optional: show loading state during printing
    try {
      const response = await fetch('/api/generate-surat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suratTugasId: letterId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate surat');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SuratTugas_${letterId}.docx`; // Use ID in filename to avoid conflicts
      a.click();
      window.URL.revokeObjectURL(url); // Clean up the URL object

    } catch (err: any) {
      setError(err.message);
      alert(`Error generating surat: ${err.message}`);
    } finally {
      setLoading(false); // Optional: hide loading state
    }
  };


  if (loading) {
    return <div>Loading approved surat tugas...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!session) {
    return <div>Please login to view approved surat tugas.</div>;
  }


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Surat Tugas Disetujui</h1>

      {approvedSuratTugas.length === 0 ? (
        <p>Tidak ada surat tugas yang disetujui.</p>
      ) : (
        <div className="space-y-4">
          {approvedSuratTugas.map((letter) => (
            <div key={letter._id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">{letter.kegiatan}</h2>
              <p><strong>Penyelenggara:</strong> {letter.penyelenggara}</p>
              <p><strong>Tempat:</strong> {letter.tempat}</p>
              <p><strong>Tanggal Kegiatan:</strong> {letter.tanggalKegiatan}</p>
              <p><strong>Status:</strong> {letter.status}</p>
              {/* Display assignees */}
              <div className="mt-2">
                <strong>Penerima Tugas:</strong>
                <ul className="list-disc list-inside">
                  {letter.assignees.map((assignee, index) => (
                    <li key={index}>{assignee.nama} ({assignee.jabatan})</li>
                  ))}
                </ul>
              </div>

              {/* Print Button */}
              <div className="mt-4">
                <button
                  onClick={() => handlePrint(letter._id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Cetak Surat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
