'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Input, Select, SelectItem, Button, Textarea } from '@heroui/react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface ProgressData {
  unit_name: string;
  program_no: string;
  program_name: string;
  progress_percentage: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes: string;
  target_date: string;
}

export default function ProgressTrackingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progressList, setProgressList] = useState<ProgressData[]>([]);
  const [formData, setFormData] = useState<ProgressData>({
    unit_name: '',
    program_no: '',
    program_name: '',
    progress_percentage: 0,
    status: 'PENDING',
    notes: '',
    target_date: ''
  });

  // Fetch existing progress data
  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await fetch('/api/progress-tracking');
      if (response.ok) {
        const data = await response.json();
        setProgressList(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/progress-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          unit_name: '',
          program_no: '',
          program_name: '',
          progress_percentage: 0,
          status: 'PENDING',
          notes: '',
          target_date: ''
        });
        
        // Refresh data
        fetchProgressData();
        alert('Progress berhasil ditambahkan!');
      } else {
        const error = await response.json();
        alert('Error: ' + error.message);
      }
    } catch (error) {
      console.error('Error submitting progress:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data progress ini?')) return;

    try {
      const response = await fetch(`/api/progress-tracking/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProgressData();
        alert('Progress berhasil dihapus!');
      }
    } catch (error) {
      console.error('Error deleting progress:', error);
      alert('Terjadi kesalahan saat menghapus data');
    }
  };

  const units = [
    'BSCC', 'Kaderisasi', 'PSDM', 'Humas', 'Keilmuan', 
    'Minat Bakat', 'Kewirausahaan', 'Sosial Kemasyarakatan'
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div>
            <h1 className="text-2xl font-bold">Progress Tracking Program Kerja</h1>
            <p className="text-gray-600">Kelola dan pantau progress semua program kerja</p>
          </div>
        </CardHeader>
      </Card>

      {/* Form Tambah Progress */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Tambah Progress Baru</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Unit/Departemen"
                placeholder="Pilih unit/departemen"
                selectedKeys={formData.unit_name ? [formData.unit_name] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFormData({...formData, unit_name: value});
                }}
                isRequired
              >
                {units.map((unit) => (
                  <SelectItem key={unit}>{unit}</SelectItem>
                ))}
              </Select>

              <Input
                type="text"
                label="Nomor Program"
                placeholder="Contoh: 001, 002, dst"
                value={formData.program_no}
                onChange={(e) => setFormData({...formData, program_no: e.target.value})}
                isRequired
              />
            </div>

            <Input
              type="text"
              label="Nama Program"
              placeholder="Masukkan nama program kerja"
              value={formData.program_name}
              onChange={(e) => setFormData({...formData, program_name: e.target.value})}
              isRequired
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Progress (%)"
                placeholder="0-100"
                min="0"
                max="100"
                value={formData.progress_percentage.toString()}
                onChange={(e) => setFormData({...formData, progress_percentage: parseInt(e.target.value) || 0})}
                isRequired
              />

              <Input
                type="date"
                label="Target Selesai"
                value={formData.target_date}
                onChange={(e) => setFormData({...formData, target_date: e.target.value})}
              />
            </div>

            <Select
              label="Status"
              selectedKeys={[formData.status]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as 'PENDING' | 'APPROVED' | 'REJECTED';
                setFormData({...formData, status: value});
              }}
            >
              <SelectItem key="PENDING">Pending</SelectItem>
              <SelectItem key="APPROVED">Approved</SelectItem>
              <SelectItem key="REJECTED">Rejected</SelectItem>
            </Select>

            <Textarea
              label="Catatan"
              placeholder="Tambahkan catatan atau keterangan..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />

            <Button
              type="submit"
              color="primary"
              disabled={loading}
              className="w-full"
              startContent={<PlusIcon className="w-4 h-4" />}
            >
              {loading ? 'Menyimpan...' : 'Tambah Progress'}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* List Progress */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Daftar Progress ({progressList.length})</h2>
        </CardHeader>
        <CardBody>
          {progressList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada data progress. Tambahkan progress baru di atas.
            </div>
          ) : (
            <div className="space-y-4">
              {progressList.map((progress, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-blue-600">{progress.unit_name}</span>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">#{progress.program_no}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          progress.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          progress.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {progress.status}
                        </span>
                      </div>
                      <h3 className="font-medium mb-2">{progress.program_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Progress: {progress.progress_percentage}%</span>
                        {progress.target_date && (
                          <span>Target: {new Date(progress.target_date).toLocaleDateString('id-ID')}</span>
                        )}
                      </div>
                      {progress.notes && (
                        <p className="text-sm text-gray-600 mt-2">{progress.notes}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => handleDelete(progress.program_no)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progress.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          progress.progress_percentage >= 80 ? 'bg-green-500' :
                          progress.progress_percentage >= 50 ? 'bg-blue-500' :
                          progress.progress_percentage >= 25 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${progress.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
