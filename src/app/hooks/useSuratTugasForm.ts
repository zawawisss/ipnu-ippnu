import { useState } from 'react';

interface Assignee {
  nama: string;
  tempatTanggalLahir: string;
  jabatan: string;
  alamat: string;
}

interface FormData {
  assignees: Assignee[];
  kegiatan: string;
  penyelenggara: string;
  tempat: string;
  tanggalKegiatan: string;
}

interface Alert {
  type: 'success' | 'danger' | null;
  message: string | null;
}

const useSuratTugasForm = () => {
  const [formData, setFormData] = useState<FormData>({
    assignees: [{ nama: '', tempatTanggalLahir: '', jabatan: '', alamat: '' }],
    kegiatan: '',
    penyelenggara: '',
    tempat: '',
    tanggalKegiatan: '',
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<Alert>({ type: null, message: null });

  const handleAssigneeChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newAssignees = [...formData.assignees];
    newAssignees[index] = { ...newAssignees[index], [e.target.name]: e.target.value };
    setFormData((prev) => ({ ...prev, assignees: newAssignees }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addAssignee = () => {
    setFormData((prev) => ({
      ...prev,
      assignees: [...prev.assignees, { nama: '', tempatTanggalLahir: '', jabatan: '', alamat: '' }],
    }));
  };

  const removeAssignee = (index: number) => {
    const newAssignees = formData.assignees.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, assignees: newAssignees }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch('/api/surat-tugas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setAlert({ type: 'success', message: 'Surat Tugas berhasil diajukan untuk persetujuan!' });
      // Optionally reset the form
      setFormData({
        assignees: [{ nama: '', tempatTanggalLahir: '', jabatan: '', alamat: '' }],
        kegiatan: '',
        penyelenggara: '',
        tempat: '',
        tanggalKegiatan: '',
      });
    } else {
      setAlert({ type: 'danger', message: 'Gagal mengajukan Surat Tugas.' });
    }

    setLoading(false);
  };

  const closeAlert = () => {
    setAlert({ type: null, message: null });
  };

  return {
    formData,
    loading,
    alert,
    handleAssigneeChange,
    handleInputChange,
    addAssignee,
    removeAssignee,
    handleSubmit,
    closeAlert,
    setFormData,
    setLoading,
    setAlert,
  };
};

export default useSuratTugasForm;
