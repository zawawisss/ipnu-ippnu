"use client";

import React, { useEffect, useState } from "react";
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
  Alert
} from "@heroui/react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface MakestaEvent {
  _id?: string;
  TANGGAL: number | string; // Excel serial as number or ISO string
  PENGKADERAN: string;
  PIMPINAN: string;
  TEMPAT: string;
  JUMLAH_IPNU: number;
  JUMLAH_IPPNU: number;
  TOTAL_JUMLAH: number;
}

function excelSerialDateToJSDate(serial: number) {
  const daysSinceEpoch = serial - 25569;
  const ms = daysSinceEpoch * 24 * 60 * 60 * 1000;
  return new Date(ms);
}

const AdminMakestaPage: React.FC = () => {
  const [data, setData] = useState<MakestaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MakestaEvent>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState<MakestaEvent | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertColor, setAlertColor] = useState<"success" | "danger">("success");
  const [showAlert, setShowAlert] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/makesta-event");
      if (!res.ok) throw new Error("Gagal mengambil data makesta");
      setData(await res.json());
    } catch (err: any) {
      setError(err.message || "Error memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({});
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (item: MakestaEvent) => {
    setFormData({ ...item });
    setSelected(item);
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Apakah yakin ingin menghapus data ini?")) return;
    try {
      const res = await fetch(`/api/makesta-event/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus data makesta");
      setAlertMessage("Berhasil menghapus makesta");
      setAlertColor("success");
      setShowAlert(true);
      fetchData();
    } catch (err: any) {
      setAlertMessage(err.message || "Error menghapus makesta");
      setAlertColor("danger");
      setShowAlert(true);
    }
  };

  const handleSave = async () => {
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing && formData._id ? `/api/makesta-event/${formData._id}` : "/api/makesta-event";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(isEditing ? "Gagal memperbarui data" : "Gagal menambah data");
      setAlertMessage(isEditing ? "Berhasil memperbarui makesta" : "Berhasil menambah makesta");
      setAlertColor("success");
      setShowAlert(true);
      onOpenChange();
      fetchData();
    } catch (err: any) {
      setAlertMessage(err.message || "Terjadi kesalahan menyimpan makesta");
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
        <h1 className="text-3xl font-bold">Manajemen Rekap Makesta (Event)</h1>
        <Button color="primary" startContent={<PlusIcon className="w-4 h-4" />} onPress={handleAdd}>Tambah Event</Button>
      </div>
      {loading && <div>Loading data...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <Table aria-label="Tabel Rekap Makesta">
        <TableHeader>
          <TableColumn>TANGGAL</TableColumn>
          <TableColumn>PENGKADERAN</TableColumn>
          <TableColumn>PIMPINAN</TableColumn>
          <TableColumn>TEMPAT</TableColumn>
          <TableColumn>PESERTA IPNU</TableColumn>
          <TableColumn>PESERTA IPPNU</TableColumn>
          <TableColumn>TOTAL PESERTA</TableColumn>
          <TableColumn>AKSI</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Belum ada data makesta">
          {data.map((item) => (
            <TableRow key={item._id}>
              <TableCell>{
                typeof item.TANGGAL === "number"
                  ? excelSerialDateToJSDate(item.TANGGAL).toLocaleDateString("id-ID")
                  : item.TANGGAL
              }</TableCell>
              <TableCell>{item.PENGKADERAN}</TableCell>
              <TableCell>{item.PIMPINAN}</TableCell>
              <TableCell>{item.TEMPAT}</TableCell>
              <TableCell>{item.JUMLAH_IPNU}</TableCell>
              <TableCell>{item.JUMLAH_IPPNU}</TableCell>
              <TableCell>{item.TOTAL_JUMLAH}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" isIconOnly variant="light" onPress={() => handleEdit(item)}>
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button size="sm" isIconOnly variant="light" color="danger" onPress={() => handleDelete(item._id)}>
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
              <ModalHeader>{isEditing ? "Edit Event Makesta" : "Tambah Event Makesta"}</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Tanggal (Excel serial atau yyyy-mm-dd)"
                    type="text"
                    value={formData.TANGGAL?.toString() || ""}
                    onChange={e => setFormData({ ...formData, TANGGAL: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Jenis Pengkaderan"
                    value={formData.PENGKADERAN || "MAKESTA"}
                    onChange={e => setFormData({ ...formData, PENGKADERAN: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Pimpinan"
                    value={formData.PIMPINAN || ""}
                    onChange={e => setFormData({ ...formData, PIMPINAN: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Tempat"
                    value={formData.TEMPAT || ""}
                    onChange={e => setFormData({ ...formData, TEMPAT: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Jumlah IPNU"
                    type="number"
                    value={formData.JUMLAH_IPNU?.toString() || "0"}
                    onChange={e => setFormData({ ...formData, JUMLAH_IPNU: parseInt(e.target.value) || 0 })}
                    isRequired
                  />
                  <Input
                    label="Jumlah IPPNU"
                    type="number"
                    value={formData.JUMLAH_IPPNU?.toString() || "0"}
                    onChange={e => setFormData({ ...formData, JUMLAH_IPPNU: parseInt(e.target.value) || 0 })}
                    isRequired
                  />
                </div>
                <Input
                  className="mt-4"
                  label="Total Peserta"
                  type="number"
                  value={formData.TOTAL_JUMLAH?.toString() || "0"}
                  readOnly
                  disabled
                />
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

export default AdminMakestaPage;
