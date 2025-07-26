"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  Alert,
  Select, SelectItem
} from "@heroui/react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { IKaderisasi } from "@/models/Kaderisasi";

interface KaderisasiPageProps {
  jenjangKader: 'MAKESTA' | 'LAKMUD' | 'LAKUT' | 'LATIN' | 'LATPEL';
}

const KaderisasiPage: React.FC<KaderisasiPageProps> = ({ jenjangKader }) => {
  const [data, setData] = useState<IKaderisasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<IKaderisasi>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState<IKaderisasi | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertColor, setAlertColor] = useState<"success" | "danger">("success");
  const [showAlert, setShowAlert] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/kaderisasi-crud?jenjangKader=${jenjangKader}`);
      if (!res.ok) throw new Error(`Gagal mengambil data ${jenjangKader}`);
      const result = await res.json();
      console.log("API Response:", result);
      setData(result.data);
    } catch (err: any) {
      setError(err.message || "Error memuat data");
    } finally {
      setLoading(false);
    }
  }, [jenjangKader]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setFormData({ jenjangKader: jenjangKader });
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (item: IKaderisasi) => {
    setFormData({ 
      ...item, 
      tanggalMulai: item.tanggalMulai ? new Date(item.tanggalMulai).toISOString().split('T')[0] : "",
      tanggalSelesai: item.tanggalSelesai ? new Date(item.tanggalSelesai).toISOString().split('T')[0] : ""
    } as any);
    setSelected(item);
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Apakah yakin ingin menghapus data ini?")) return;
    try {
      const res = await fetch(`/api/kaderisasi-crud?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Gagal menghapus data ${jenjangKader}`);
      setAlertMessage(`Berhasil menghapus ${jenjangKader}`);
      setAlertColor("success");
      setShowAlert(true);
      fetchData();
    } catch (err: any) {
      setAlertMessage(err.message || `Error menghapus ${jenjangKader}`);
      setAlertColor("danger");
      setShowAlert(true);
    }
  };

  const handleSave = async () => {
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing && formData._id ? `/api/kaderisasi-crud?id=${formData._id}` : "/api/kaderisasi-crud";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tanggalMulai: formData.tanggalMulai ? new Date(formData.tanggalMulai) : undefined,
        }),
      });
      if (!res.ok) throw new Error(isEditing ? `Gagal memperbarui data ${jenjangKader}` : `Gagal menambah data ${jenjangKader}`);
      setAlertMessage(isEditing ? `Berhasil memperbarui ${jenjangKader}` : `Berhasil menambah ${jenjangKader}`);
      setAlertColor("success");
      setShowAlert(true);
      onOpenChange();
      fetchData();
    } catch (err: any) {
      setAlertMessage(err.message || `Terjadi kesalahan menyimpan ${jenjangKader}`);
      setAlertColor("danger");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    if (alertMessage) {
      setShowAlert(true);
      const t = setTimeout(() => {
        setShowAlert(false);
        setAlertMessage("");
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [alertMessage]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {showAlert && (
        <div className="fixed top-4 right-4 z-50">
          <Alert color={alertColor}>{alertMessage}</Alert>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Peserta {jenjangKader}</h1>
        <Button color="primary" startContent={<PlusIcon className="w-4 h-4" />} onPress={handleAdd}>Tambah Peserta</Button>
      </div>
      {loading && <div>Loading data...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <Table aria-label={`Tabel Peserta ${jenjangKader}`}>
        <TableHeader>
          <TableColumn>NAMA</TableColumn>
          <TableColumn>ORGANISASI</TableColumn>
          <TableColumn>KOMISARIAT</TableColumn>
          <TableColumn>KECAMATAN</TableColumn>
          <TableColumn>DESA</TableColumn>
          <TableColumn>TANGGAL MULAI</TableColumn>
          <TableColumn>MENTOR</TableColumn>
          <TableColumn>AKSI</TableColumn>
        </TableHeader>
        <TableBody emptyContent={`Belum ada data peserta ${jenjangKader}`}>
          {data.map((item) => (
            <TableRow key={String(item._id)}>
              <TableCell>{item.nama}</TableCell>
              <TableCell>{item.organization}</TableCell>
              <TableCell>{item.komisariat}</TableCell>
              <TableCell>{item.kecamatan}</TableCell>
              <TableCell>{item.desa}</TableCell>
              <TableCell>{new Date(item.tanggalMulai).toLocaleDateString("id-ID")}</TableCell>
              <TableCell>{item.mentor}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" isIconOnly variant="light" onPress={() => handleEdit(item)}>
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button size="sm" isIconOnly variant="light" color="danger" onPress={() => handleDelete(String(item._id))}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{isEditing ? `Edit Peserta ${jenjangKader}` : `Tambah Peserta ${jenjangKader}`}</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nama"
                    type="text"
                    value={formData.nama || ""}
                    onChange={e => setFormData({ ...formData, nama: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="NIM (Opsional)"
                    type="text"
                    value={formData.nim || ""}
                    onChange={e => setFormData({ ...formData, nim: e.target.value })}
                  />
                  <Input
                    label="Komisariat"
                    value={formData.komisariat || ""}
                    onChange={e => setFormData({ ...formData, komisariat: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Kecamatan"
                    value={formData.kecamatan || ""}
                    onChange={e => setFormData({ ...formData, kecamatan: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Desa"
                    value={formData.desa || ""}
                    onChange={e => setFormData({ ...formData, desa: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Tanggal Mulai"
                    type="date"
                    value={typeof formData.tanggalMulai === 'string' ? formData.tanggalMulai : (formData.tanggalMulai ? new Date(formData.tanggalMulai).toISOString().split('T')[0] : "")}
                    onChange={e => setFormData({ ...formData, tanggalMulai: e.target.value as any })}
                    isRequired
                  />
                  <Input
                    label="Tanggal Selesai (Opsional)"
                    type="date"
                    value={typeof formData.tanggalSelesai === 'string' ? formData.tanggalSelesai : (formData.tanggalSelesai ? new Date(formData.tanggalSelesai).toISOString().split('T')[0] : "")}
                    onChange={e => setFormData({ ...formData, tanggalSelesai: e.target.value as any })}
                  />
                  <Input
                    label="Mentor"
                    value={formData.mentor || ""}
                    onChange={e => setFormData({ ...formData, mentor: e.target.value })}
                    isRequired
                  />
                  <Select
                    label="Organisasi"
                    placeholder="Pilih Organisasi"
                    selectedKeys={formData.organization ? [formData.organization] : []}
                    onSelectionChange={(keys) => {
                      const selectedOrg = Array.from(keys).join('');
                      setFormData({ ...formData, organization: selectedOrg as 'IPNU' | 'IPPNU' });
                    }}
                    isRequired
                  >
                    <SelectItem key="IPNU">IPNU</SelectItem>
                    <SelectItem key="IPPNU">IPPNU</SelectItem>
                  </Select>
                  <Select
                    label="Status Kader"
                    placeholder="Pilih Status Kader"
                    selectedKeys={formData.statusKader ? [formData.statusKader] : []}
                    onSelectionChange={(keys) => {
                      const selectedStatus = Array.from(keys).join('');
                      setFormData({ ...formData, statusKader: selectedStatus as 'Aktif' | 'Tidak Aktif' | 'Alumni' });
                    }}
                    isRequired
                  >
                    <SelectItem key="Aktif">Aktif</SelectItem>
                    <SelectItem key="Tidak Aktif">Tidak Aktif</SelectItem>
                    <SelectItem key="Alumni">Alumni</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" onPress={handleSave}>
                  {isEditing ? "Perbarui" : "Simpan"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default KaderisasiPage;
