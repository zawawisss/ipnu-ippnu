"use client";

import { useState, useEffect } from "react";
import { Card, Input, Button } from "@heroui/react";
import { Trash2, Edit } from "lucide-react"; // Import icons for delete and edit

export default function KeuanganForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  // State untuk form input
  const [form, setForm] = useState({
    _id: "", // Tambahkan _id untuk keperluan edit
    tanggal: "",
    sumber: "",
    penggunaan: "",
    jenisTransaksi: "debet", // 'debet' atau 'kredit'
    jumlah: "",
    ket: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [laporan, setLaporan] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false); // State untuk mode edit

  // Effect untuk mengambil data keuangan saat komponen dimuat
  useEffect(() => {
    fetchLaporan();
  }, []);

  // Fungsi untuk mengambil data laporan keuangan dari API
  const fetchLaporan = async () => {
    try {
      const res = await fetch("/api/keuangan");
      if (!res.ok) throw new Error("Gagal mengambil data laporan");
      const data = await res.json();
      setLaporan(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengambil data");
      setLaporan([]);
    }
  };

  // Handler untuk perubahan input form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handler untuk submit form (tambah atau update data)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validasi input jumlah
    const parsedJumlah = parseFloat(form.jumlah);
    if (isNaN(parsedJumlah) || parsedJumlah < 0) {
      setError("Jumlah harus angka positif.");
      setLoading(false);
      return;
    }

    // Siapkan data untuk dikirim ke API
    const dataToSend = {
      tanggal: form.tanggal,
      sumber: form.sumber,
      penggunaan: form.penggunaan,
      debet: form.jenisTransaksi === "debet" ? parsedJumlah : 0,
      kredit: form.jenisTransaksi === "kredit" ? parsedJumlah : 0,
      jumlah: parsedJumlah, // Simpan jumlah asli
      ket: form.ket,
    };

    try {
      let res;
      if (isEditing) {
        // Jika dalam mode edit, kirim PUT request
        res = await fetch("/api/keuangan", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: form._id, ...dataToSend }),
        });
      } else {
        // Jika tidak dalam mode edit, kirim POST request
        res = await fetch("/api/keuangan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
      }

      if (!res.ok) throw new Error("Gagal menyimpan data");

      // Reset form setelah berhasil
      setForm({
        _id: "",
        tanggal: "",
        sumber: "",
        penggunaan: "",
        jenisTransaksi: "debet",
        jumlah: "",
        ket: "",
      });
      setIsEditing(false); // Keluar dari mode edit
      fetchLaporan(); // Segarkan data laporan
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    }
    setLoading(false);
  };

  // Handler untuk mengisi form saat tombol edit diklik
  const handleEdit = (rowData: any) => {
    setForm({
      _id: rowData._id,
      tanggal: rowData.tanggal.split('T')[0], // Format tanggal agar sesuai dengan input type="date"
      sumber: rowData.sumber,
      penggunaan: rowData.penggunaan,
      jenisTransaksi: rowData.debet > 0 ? "debet" : "kredit",
      jumlah: rowData.debet > 0 ? rowData.debet.toString() : rowData.kredit.toString(),
      ket: rowData.ket,
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll ke atas form
  };

  // Handler untuk menghapus data
  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/keuangan?id=${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Gagal menghapus data");
        fetchLaporan(); // Segarkan data laporan
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat menghapus data");
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      <Card className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Input
              label="Tgl Transaksi"
              name="tanggal"
              type="date"
              value={form.tanggal}
              onChange={handleChange}
              required
              className="text-base md:text-lg w-full bg-white dark:bg-gray-900"
            />
            <Input
              label="Sumber Pemasukan"
              name="sumber"
              value={form.sumber}
              onChange={handleChange}
              className="text-base md:text-lg w-full bg-white dark:bg-gray-900"
            />
            <Input
              label="Penggunaan"
              name="penggunaan"
              value={form.penggunaan}
              onChange={handleChange}
              className="text-base md:text-lg w-full bg-white dark:bg-gray-900"
            />
            {/* Dropdown untuk jenis transaksi */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Jenis Transaksi
              </label>
              <select
                name="jenisTransaksi"
                value={form.jenisTransaksi}
                onChange={handleChange}
                className="input input-bordered w-full text-base md:text-lg bg-white dark:bg-gray-900"
              >
                <option value="debet">Pemasukan (Debet)</option>
                <option value="kredit">Pengeluaran (Kredit)</option>
              </select>
            </div>
            <Input
              label="Jumlah"
              name="jumlah"
              type="number"
              value={form.jumlah}
              onChange={handleChange}
              min={0}
              required
              className="text-base md:text-lg w-full bg-white dark:bg-gray-900"
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Keterangan
              </label>
              <textarea
                name="ket"
                value={form.ket}
                onChange={handleChange}
                rows={2}
                className="input input-bordered w-full text-base md:text-lg bg-white dark:bg-gray-900"
              />
            </div>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <Button
            type="submit"
            color="primary"
            isLoading={loading}
            className="text-base md:text-lg py-4 md:py-6 w-full md:w-auto"
          >
            {isEditing ? "Update Data" : "Simpan Data"}
          </Button>
          {isEditing && (
            <Button
              type="button"
              color="secondary"
              onClick={() => {
                setIsEditing(false);
                setForm({
                  _id: "",
                  tanggal: "",
                  sumber: "",
                  penggunaan: "",
                  jenisTransaksi: "debet",
                  jumlah: "",
                  ket: "",
                });
              }}
              className="ml-2 text-base md:text-lg py-4 md:py-6 w-full md:w-auto"
            >
              Batal Edit
            </Button>
          )}
        </form>
      </Card>

      <Card className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
          Laporan Keuangan
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm md:text-base border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900">
                <th className="px-3 py-2 border-b">Tanggal</th>
                <th className="px-3 py-2 border-b">Sumber</th>
                <th className="px-3 py-2 border-b">Penggunaan</th>
                <th className="px-3 py-2 border-b">Debet</th>
                <th className="px-3 py-2 border-b">Kredit</th>
                <th className="px-3 py-2 border-b">Jumlah</th>
                <th className="px-3 py-2 border-b">Keterangan</th>
                <th className="px-3 py-2 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {laporan.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                laporan.map((row) => (
                  <tr
                    key={row._id} // Gunakan _id sebagai key
                    className="even:bg-gray-50 dark:even:bg-gray-900"
                  >
                    <td className="px-3 py-2 border-b">
                      {new Date(row.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {(row.debet ?? 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {(row.kredit ?? 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {(row.jumlah ?? 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 border-b">{row.ket}</td>
                    <td className="px-3 py-2 border-b">
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          onClick={() => handleEdit(row)}
                          className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleDelete(row._id)}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
