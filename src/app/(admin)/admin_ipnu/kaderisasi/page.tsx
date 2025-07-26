'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Button, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Pagination,
  Divider,
  Alert
} from '@heroui/react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import ImportKaderisasiButton from '@/app/components/admin/ImportKaderisasiButton';

interface KaderisasiData {
  _id?: string;
  nama: string;
  nim?: string;
  komisariat: string;
  kecamatan: string;
  desa: string;
  jenjangKader: 'PKD' | 'PKL' | 'PKN';
  statusKader: 'Aktif' | 'Tidak Aktif' | 'Alumni';
  tanggalMulai: string;
  tanggalSelesai?: string;
  mentor: string;
  materiSelesai: string[];
  nilaiAkhir?: number;
  sertifikat: boolean;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
}

const jenjangKaderOptions = [
  { key: 'PKD', label: 'Pelatihan Kader Dasar (PKD)' },
  { key: 'PKL', label: 'Pelatihan Kader Lanjutan (PKL)' },
  { key: 'PKN', label: 'Pelatihan Kader Nasional (PKN)' }
];

const statusKaderOptions = [
  { key: 'Aktif', label: 'Aktif' },
  { key: 'Tidak Aktif', label: 'Tidak Aktif' },
  { key: 'Alumni', label: 'Alumni' }
];

const materiPKD = [
  'Sejarah IPNU-IPPNU',
  'Ideologi Pancasila',
  'Kepemimpinan',
  'Organisasi dan Manajemen',
  'Keislaman dan Kemasyarakatan'
];

const materiPKL = [
  'Manajemen Strategis',
  'Public Speaking',
  'Advocacy dan Lobbying',
  'Manajemen Konflik',
  'Kewirausahaan Sosial'
];

const materiPKN = [
  'Leadership Excellence',
  'Policy Making',
  'International Relations',
  'Research and Development',
  'Networking and Partnership'
];

const AdminIPNUKaderisasiPage: React.FC = () => {
  const [kaderisasiData, setKaderisasiData] = useState<KaderisasiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKader, setSelectedKader] = useState<KaderisasiData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertColor, setAlertColor] = useState<'success' | 'danger'>('success');

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();

  const [formData, setFormData] = useState<Partial<KaderisasiData>>({
    nama: '',
    nim: '',
    komisariat: '',
    kecamatan: '',
    desa: '',
    jenjangKader: 'PKD',
    statusKader: 'Aktif',
    tanggalMulai: '',
    tanggalSelesai: '',
    mentor: '',
    materiSelesai: [],
    nilaiAkhir: 0,
    sertifikat: false,
    catatan: ''
  });

  const fetchKaderisasiData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        organization: 'IPNU'
      });
      const res = await fetch(`/api/kaderisasi?${queryParams}`);
      if (!res.ok) throw new Error('Gagal mengambil data kaderisasi');
      const data = await res.json();
      setKaderisasiData(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data kaderisasi.');
      setAlertMessage('Gagal memuat data kaderisasi');
      setAlertColor('danger');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchKaderisasiData();
  }, [fetchKaderisasiData]);

  useEffect(() => {
    if (alertMessage) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleSave = async () => {
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/kaderisasi/${selectedKader?._id}` : '/api/kaderisasi';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, organization: 'IPNU' })
      });

      if (!res.ok) throw new Error('Gagal menyimpan data kaderisasi');
      
      setAlertMessage(isEditing ? 'Data kaderisasi berhasil diperbarui' : 'Data kaderisasi berhasil ditambahkan');
      setAlertColor('success');
      setShowAlert(true);
      onOpenChange();
      fetchKaderisasiData();
      resetForm();
    } catch (err: any) {
      setAlertMessage(err.message || 'Gagal menyimpan data kaderisasi');
      setAlertColor('danger');
      setShowAlert(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data kaderisasi ini?')) return;
    
    try {
      const res = await fetch(`/api/kaderisasi/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus data kaderisasi');
      
      setAlertMessage('Data kaderisasi berhasil dihapus');
      setAlertColor('success');
      setShowAlert(true);
      fetchKaderisasiData();
    } catch (err: any) {
      setAlertMessage(err.message || 'Gagal menghapus data kaderisasi');
      setAlertColor('danger');
      setShowAlert(true);
    }
  };

  const handleEdit = (kader: KaderisasiData) => {
    setSelectedKader(kader);
    setFormData({
      ...kader,
      tanggalMulai: kader.tanggalMulai ? new Date(kader.tanggalMulai).toISOString().slice(0, 10) : '',
      tanggalSelesai: kader.tanggalSelesai ? new Date(kader.tanggalSelesai).toISOString().slice(0, 10) : ''
    });
    setIsEditing(true);
    onOpen();
  };

  const handleView = (kader: KaderisasiData) => {
    setSelectedKader(kader);
    onViewOpen();
  };

  const handleAdd = () => {
    resetForm();
    setIsEditing(false);
    onOpen();
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      nim: '',
      komisariat: '',
      kecamatan: '',
      desa: '',
      jenjangKader: 'PKD',
      statusKader: 'Aktif',
      tanggalMulai: '',
      tanggalSelesai: '',
      mentor: '',
      materiSelesai: [],
      nilaiAkhir: 0,
      sertifikat: false,
      catatan: ''
    });
    setSelectedKader(null);
  };

  const getMateriOptions = (jenjang: string) => {
    switch (jenjang) {
      case 'PKD': return materiPKD;
      case 'PKL': return materiPKL;
      case 'PKN': return materiPKN;
      default: return [];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif': return 'success';
      case 'Tidak Aktif': return 'danger';
      case 'Alumni': return 'primary';
      default: return 'default';
    }
  };

  const getJenjangColor = (jenjang: string) => {
    switch (jenjang) {
      case 'PKD': return 'secondary';
      case 'PKL': return 'primary';
      case 'PKN': return 'warning';
      default: return 'default';
    }
  };

  if (loading) return <div className="text-center p-10">Memuat data kaderisasi...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Alert Notification */}
      {showAlert && (
        <div className="fixed top-4 right-4 z-50">
          <Alert color={alertColor} className="max-w-md">
            {alertMessage}
          </Alert>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Manajemen Kaderisasi IPNU
        </h1>
        <div className="flex gap-3">
          <ImportKaderisasiButton 
            organization="IPNU" 
            onImportComplete={fetchKaderisasiData}
          />
          <Button color="primary" onPress={handleAdd} startContent={<PlusIcon className="w-4 h-4" />}>
            Tambah Kader
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Cari berdasarkan nama, NIM, atau komisariat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button color="primary" onPress={() => setCurrentPage(1)}>
              Cari
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Kader</p>
            <p className="text-2xl font-bold">{kaderisasiData.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Kader Aktif</p>
            <p className="text-2xl font-bold text-green-600">
              {kaderisasiData.filter(k => k.statusKader === 'Aktif').length}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Alumni</p>
            <p className="text-2xl font-bold text-blue-600">
              {kaderisasiData.filter(k => k.statusKader === 'Alumni').length}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Bersertifikat</p>
            <p className="text-2xl font-bold text-yellow-600">
              {kaderisasiData.filter(k => k.sertifikat).length}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardBody className="p-0">
          <Table aria-label="Tabel Data Kaderisasi IPNU">
            <TableHeader>
              <TableColumn>NAMA</TableColumn>
              <TableColumn>KOMISARIAT</TableColumn>
              <TableColumn>JENJANG</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>MENTOR</TableColumn>
              <TableColumn>SERTIFIKAT</TableColumn>
              <TableColumn>AKSI</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Tidak ada data kaderisasi">
              {kaderisasiData.map((kader) => (
                <TableRow key={kader._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{kader.nama}</p>
                      {kader.nim && <p className="text-sm text-gray-500">{kader.nim}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{kader.komisariat}</p>
                      <p className="text-sm text-gray-500">{kader.kecamatan}, {kader.desa}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip color={getJenjangColor(kader.jenjangKader)} size="sm">
                      {kader.jenjangKader}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip color={getStatusColor(kader.statusKader)} size="sm">
                      {kader.statusKader}
                    </Chip>
                  </TableCell>
                  <TableCell>{kader.mentor}</TableCell>
                  <TableCell>
                    <Chip color={kader.sertifikat ? 'success' : 'default'} size="sm">
                      {kader.sertifikat ? 'Ya' : 'Tidak'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleView(kader)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEdit(kader)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDelete(kader._id!)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {isEditing ? 'Edit Data Kaderisasi' : 'Tambah Data Kaderisasi'}
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nama Lengkap"
                    placeholder="Masukkan nama lengkap"
                    value={formData.nama || ''}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="NIM (Opsional)"
                    placeholder="Masukkan NIM"
                    value={formData.nim || ''}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  />
                  <Input
                    label="Komisariat"
                    placeholder="Masukkan komisariat"
                    value={formData.komisariat || ''}
                    onChange={(e) => setFormData({ ...formData, komisariat: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Kecamatan"
                    placeholder="Masukkan kecamatan"
                    value={formData.kecamatan || ''}
                    onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Desa"
                    placeholder="Masukkan desa"
                    value={formData.desa || ''}
                    onChange={(e) => setFormData({ ...formData, desa: e.target.value })}
                    isRequired
                  />
                  <Select
                    label="Jenjang Kader"
                    placeholder="Pilih jenjang kader"
                    selectedKeys={formData.jenjangKader ? [formData.jenjangKader] : []}
                    onChange={(e) => setFormData({ ...formData, jenjangKader: e.target.value as any })}
                    isRequired
                  >
                    {jenjangKaderOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Status Kader"
                    placeholder="Pilih status kader"
                    selectedKeys={formData.statusKader ? [formData.statusKader] : []}
                    onChange={(e) => setFormData({ ...formData, statusKader: e.target.value as any })}
                    isRequired
                  >
                    {statusKaderOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    type="date"
                    label="Tanggal Mulai"
                    value={formData.tanggalMulai || ''}
                    onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                    isRequired
                  />
                  <Input
                    type="date"
                    label="Tanggal Selesai (Opsional)"
                    value={formData.tanggalSelesai || ''}
                    onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                  />
                  <Input
                    label="Mentor"
                    placeholder="Masukkan nama mentor"
                    value={formData.mentor || ''}
                    onChange={(e) => setFormData({ ...formData, mentor: e.target.value })}
                    isRequired
                  />
                  <Input
                    type="number"
                    label="Nilai Akhir (0-100)"
                    placeholder="0"
                    value={formData.nilaiAkhir?.toString() || ''}
                    onChange={(e) => setFormData({ ...formData, nilaiAkhir: parseFloat(e.target.value) || 0 })}
                    min={0}
                    max={100}
                  />
                </div>
                <Divider className="my-4" />
                <Textarea
                  label="Catatan"
                  placeholder="Masukkan catatan tambahan"
                  value={formData.catatan || ''}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  rows={3}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" onPress={handleSave}>
                  {isEditing ? 'Perbarui' : 'Simpan'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal 
        isOpen={isViewOpen} 
        onOpenChange={onViewOpenChange}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Detail Data Kaderisasi</ModalHeader>
              <ModalBody>
                {selectedKader && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold">Informasi Dasar</h3>
                      </CardHeader>
                      <CardBody>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Nama:</p>
                            <p className="font-medium">{selectedKader.nama}</p>
                          </div>
                          {selectedKader.nim && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">NIM:</p>
                              <p className="font-medium">{selectedKader.nim}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Komisariat:</p>
                            <p className="font-medium">{selectedKader.komisariat}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Lokasi:</p>
                            <p className="font-medium">{selectedKader.kecamatan}, {selectedKader.desa}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold">Informasi Kaderisasi</h3>
                      </CardHeader>
                      <CardBody>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Jenjang:</p>
                            <Chip color={getJenjangColor(selectedKader.jenjangKader)}>
                              {selectedKader.jenjangKader}
                            </Chip>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Status:</p>
                            <Chip color={getStatusColor(selectedKader.statusKader)}>
                              {selectedKader.statusKader}
                            </Chip>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Mentor:</p>
                            <p className="font-medium">{selectedKader.mentor}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Nilai Akhir:</p>
                            <p className="font-medium">{selectedKader.nilaiAkhir || 'Belum dinilai'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal Mulai:</p>
                            <p className="font-medium">
                              {selectedKader.tanggalMulai ? new Date(selectedKader.tanggalMulai).toLocaleDateString('id-ID') : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal Selesai:</p>
                            <p className="font-medium">
                              {selectedKader.tanggalSelesai ? new Date(selectedKader.tanggalSelesai).toLocaleDateString('id-ID') : 'Belum selesai'}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {selectedKader.catatan && (
                      <Card>
                        <CardHeader>
                          <h3 className="text-lg font-semibold">Catatan</h3>
                        </CardHeader>
                        <CardBody>
                          <p>{selectedKader.catatan}</p>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminIPNUKaderisasiPage;
