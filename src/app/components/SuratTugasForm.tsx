"use client";

import { PlusCircleIcon, MinusCircleIcon } from "@heroicons/react/24/solid";
import { Alert } from "@heroui/alert";
import { Input } from "@heroui/react";
import useSuratTugasForm from "@/app/hooks/useSuratTugasForm";

interface Assignee {
  nama: string;
  tempatTanggalLahir: string;
  jabatan: string;
  alamat: string;
}

export default function SuratTugasForm() {
  const {
    formData,
    loading,
    alert,
    handleAssigneeChange,
    handleInputChange,
    addAssignee,
    removeAssignee,
    handleSubmit,
    closeAlert,
  } = useSuratTugasForm();

  const eventFields = [
    ["kegiatan", "Mengikuti Kegiatan"],
    ["penyelenggara", "Diselenggarakan oleh"],
    ["tempat", "Tempat Kegiatan"],
    ["tanggalKegiatan", "Tanggal Kegiatan"],
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl mx-auto p-6 bg-white rounded shadow dark:bg-gray-900 dark:text-gray-200 dark:shadow-lg"
    >
      {alert?.message && alert.type && (
        <Alert
          color={alert.type === "success" ? "success" : "danger"}
          title={alert.message}
          onClose={closeAlert}
          className="fixed top-1rem right-1rem z-50"
        />
      )}
      {formData.assignees.map((assignee, index) => (
        <div
          key={index}
          className="border p-4 rounded space-y-2 dark:border-gray-700"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold dark:text-gray-200">
              Penerima Tugas {index + 1}
            </h3>
            {formData.assignees.length > 1 && (
              <button
                type="button"
                onClick={() => removeAssignee(index)}
                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                aria-label="Hapus Penerima Tugas"
              >
                <MinusCircleIcon className="h-6 w-6" />
              </button>
            )}
          </div>
          <div>
            <label className="block font-medium dark:text-gray-300">
              Nama Lengkap
            </label>
            <Input
              type="text"
              name="nama"
              value={assignee.nama}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAssigneeChange(index, e)}
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block font-medium dark:text-gray-300">
              Tempat / Tanggal Lahir
            </label>
            <Input
              type="text"
              name="tempatTanggalLahir"
              value={assignee.tempatTanggalLahir}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAssigneeChange(index, e)}
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block font-medium dark:text-gray-300">
              Jabatan
            </label>
            <Input
              type="text"
              name="jabatan"
              value={assignee.jabatan}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAssigneeChange(index, e)}
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block font-medium dark:text-gray-300">
              Alamat
            </label>
            <Input
              type="text"
              name="alamat"
              value={assignee.alamat}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAssigneeChange(index, e)}
              className="w-full"
              required
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addAssignee}
        className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
      >
        <PlusCircleIcon className="h-6 w-6" />
        <span>Tambah Penerima Tugas</span>
      </button>

      <div className="space-y-4 border p-4 rounded dark:border-gray-700">
        <h3 className="text-lg font-semibold dark:text-gray-200">
          Detail Kegiatan
        </h3>
        {eventFields.map(([name, label]) => (
          <div key={name}>
            <label className="block font-medium dark:text-gray-300">
              {label}
            </label>
            <Input
              type="text"
              name={name}
              value={
                formData[
                  name as
                    | "kegiatan"
                    | "penyelenggara"
                    | "tempat"
                    | "tanggalKegiatan"
                ]
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
              className="w-full"
              required
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
      >
        {loading ? "Membuat Surat..." : "Generate Surat"}
      </button>
    </form>
  );
}
