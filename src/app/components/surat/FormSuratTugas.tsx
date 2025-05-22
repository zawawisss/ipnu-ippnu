"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { Button, Input, Card } from "@heroui/react";

interface Assignee {
  nama: string;
  tempatTanggalLahir: string;
  jabatan: string;
  alamat: string;
}

interface SuratTugasData {
  assignees: Assignee[];
  mengikuti_kegiatan: string;
  diselenggarakan_oleh: string;
  tempat_kegiatan: string;
  tanggal_kegiatan: string;
}

export default function FormSuratTugas() {
  const [formData, setFormData] = useState<SuratTugasData>({
    assignees: [{ nama: "", tempatTanggalLahir: "", jabatan: "", alamat: "" }],
    mengikuti_kegiatan: "",
    diselenggarakan_oleh: "",
    tempat_kegiatan: "",
    tanggal_kegiatan: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssigneeChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const updatedAssignees = [...formData.assignees];
    updatedAssignees[index][name as keyof Assignee] = value;
    setFormData((prev) => ({ ...prev, assignees: updatedAssignees }));
  };

  const addAssignee = () => {
    setFormData((prev) => ({
      ...prev,
      assignees: [
        ...prev.assignees,
        { nama: "", tempatTanggalLahir: "", jabatan: "", alamat: "" },
      ],
    }));
  };

  const handleRemoveAssignee = (index: number) => {
    if (formData.assignees.length > 1) {
      setFormData((prev) => ({
        ...prev,
        assignees: prev.assignees.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/generateSuratTugas", formData);
      window.location.href = response.data.downloadUrl;
    } catch (error) {
      alert("Terjadi kesalahan saat membuat surat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      {formData.assignees.map((assignee, index) => (
        <Card
          key={index}
          className="p-4 md:p-6 mb-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors relative"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100">
              Anggota {index + 1}
            </div>
            {formData.assignees.length > 1 && (
              <Button
                type="button"
                color="danger"
                variant="flat"
                size="sm"
                onClick={() => handleRemoveAssignee(index)}
                className="absolute top-2 right-2"
              >
                Hapus
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Input
              label="Nama"
              name="nama"
              value={assignee.nama}
              onChange={(e) => handleAssigneeChange(index, e)}
              required
              className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            />
            <Input
              label="Tempat, Tanggal Lahir"
              name="tempatTanggalLahir"
              value={assignee.tempatTanggalLahir}
              onChange={(e) => handleAssigneeChange(index, e)}
              required
              className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            />
            <Input
              label="Jabatan"
              name="jabatan"
              value={assignee.jabatan}
              onChange={(e) => handleAssigneeChange(index, e)}
              required
              className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            />
            <Input
              label="Alamat"
              name="alamat"
              value={assignee.alamat}
              onChange={(e) => handleAssigneeChange(index, e)}
              required
              className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            />
          </div>
        </Card>
      ))}
      <Button
        type="button"
        onClick={addAssignee}
        color="secondary"
        variant="flat"
        className="text-base md:text-lg"
      >
        Tambah Anggota
      </Button>

      <Card className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Input
            label="Mengikuti Kegiatan"
            name="mengikuti_kegiatan"
            value={formData.mengikuti_kegiatan}
            onChange={handleInputChange}
            required
            className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
          />
          <Input
            label="Diselenggarakan Oleh"
            name="diselenggarakan_oleh"
            value={formData.diselenggarakan_oleh}
            onChange={handleInputChange}
            required
            className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
          />
          <Input
            label="Tempat Kegiatan"
            name="tempat_kegiatan"
            value={formData.tempat_kegiatan}
            onChange={handleInputChange}
            required
            className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
          />
          <Input
            label="Tanggal Kegiatan"
            name="tanggal_kegiatan"
            type="date"
            value={formData.tanggal_kegiatan}
            onChange={handleInputChange}
            required
            className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
          />
        </div>
      </Card>

      <Button
        type="submit"
        color="primary"
        isLoading={loading}
        className="text-base md:text-lg py-4 md:py-6 w-full md:w-auto"
      >
        Buat Surat
      </Button>
    </form>
  );
}
