"use client";

import { useState, useEffect } from "react";
import { Card, Input, Button, Select, SelectItem, Alert } from "@heroui/react";
import { Trash2, Edit, ChevronDown, ChevronUp, FileText, FileSpreadsheet } from "lucide-react"; // Add FileSpreadsheet icon
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"; // Import plugin
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"; // Import plugin
import * as XLSX from 'xlsx'; // Import xlsx library

// Extend Day.js with the plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function KeuanganForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState({
    _id: "",
    tanggal: "",
    sumber: "",
    penggunaan: "",
    jenisTransaksi: "debet",
    jumlah: "",
    ket: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [laporan, setLaporan] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false); // State to toggle form visibility

  // State for filters
  const [filterTanggalMulai, setFilterTanggalMulai] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");
  const [filterJenisTransaksi, setFilterJenisTransaksi] = useState("all"); // 'all', 'debet', 'kredit'
  const [searchTerm, setSearchTerm] = useState("");

  // State for alerts
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColor, setAlertColor] = useState<"success" | "danger">("success");

  // State for initial data fetch loading
  const [isFetchingLaporan, setIsFetchingLaporan] = useState(true);

  useEffect(() => {
    fetchLaporan();
  }, []);

  // Effect to manage alert visibility
  useEffect(() => {
    if (alertMessage) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
        setAlertMessage("");
      }, 3000); // Alert disappears after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const fetchLaporan = async () => {
    setIsFetchingLaporan(true);
    try {
      const res = await fetch("/api/keuangan"); // Fetches all data
      if (!res.ok) throw new Error("Gagal mengambil data laporan");
      const data = await res.json();
      setLaporan(data);
    } catch (err: any) {
      setAlertMessage(err.message || "Terjadi kesalahan saat mengambil data");
      setAlertColor("danger");
      setLaporan([]);
    } finally {
      setIsFetchingLaporan(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // Explicitly cast e.target.name to keyof typeof form
    setForm({ ...form, [e.target.name as keyof typeof form]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, jenisTransaksi: e.target.value });
  };

  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digit characters except the first comma/dot for decimals
    const numericValue = value.replace(/[^0-9,.]/g, '').replace(/,/g, '.');
    setForm({ ...form, jumlah: numericValue });
  };

  const formatRupiah = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined || amount === "") return "Rp0";
    let num: number;
    if (typeof amount === 'string') {
      // Clean the string by removing thousands separators (dots) and replacing decimal comma with dot
      const cleanedString = amount.replace(/\./g, '').replace(/,/g, '.');
      num = parseFloat(cleanedString);
    } else {
      num = amount;
    }
    if (isNaN(num)) return "Rp0";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAlertMessage(""); // Clear previous alert

    // Ensure parsing for submission also handles thousands separators and decimal comma
    const parsedJumlah = parseFloat(form.jumlah.replace(/\./g, '').replace(/,/g, '.'));

    if (isNaN(parsedJumlah) || parsedJumlah < 0) {
      setError("Jumlah harus angka positif.");
      setLoading(false);
      return;
    }

    const dataToSend = {
      tanggal: form.tanggal,
      sumber: form.sumber,
      penggunaan: form.penggunaan,
      debet: form.jenisTransaksi === "debet" ? parsedJumlah : 0,
      kredit: form.jenisTransaksi === "kredit" ? parsedJumlah : 0,
      jumlah: parsedJumlah,
      ket: form.ket,
    };

    try {
      let res;
      if (isEditing) {
        res = await fetch("/api/keuangan", {
          method: "PUT", // PUT request for updating
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: form._id, ...dataToSend }),
        });
      } else {
        res = await fetch("/api/keuangan", {
          method: "POST", // POST request for new entry
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
      }

      if (!res.ok) throw new Error("Gagal menyimpan data");

      setForm({
        _id: "",
        tanggal: "",
        sumber: "",
        penggunaan: "",
        jenisTransaksi: "debet",
        jumlah: "",
        ket: "",
      });
      setIsEditing(false);
      fetchLaporan();
      setAlertMessage(`Data berhasil ${isEditing ? 'diperbarui' : 'disimpan'}!`);
      setAlertColor("success");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setAlertMessage(err.message || "Terjadi kesalahan");
      setAlertColor("danger");
    }
    setLoading(false);
  };

  const handleEdit = (rowData: any) => {
    setForm({
      _id: rowData._id,
      tanggal: dayjs(rowData.tanggal).format("YYYY-MM-DD"), // Format date for input
      sumber: rowData.sumber,
      penggunaan: rowData.penggunaan,
      jenisTransaksi: rowData.debet > 0 ? "debet" : "kredit",
      jumlah: (rowData.debet > 0 ? rowData.debet : rowData.kredit).toString(),
      ket: rowData.ket,
    });
    setIsEditing(true);
    setShowForm(true); // Show form when editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) { // Using window.confirm for now
      setLoading(true);
      setAlertMessage(""); // Clear previous alert
      try {
        const res = await fetch(`/api/keuangan?id=${id}`, {
          method: "DELETE", // DELETE request
        });
        if (!res.ok) throw new Error("Gagal menghapus data");
        fetchLaporan();
        setAlertMessage("Data berhasil dihapus!");
        setAlertColor("success");
      } catch (err: any) {
        setAlertMessage(err.message || "Terjadi kesalahan saat menghapus data");
        setAlertColor("danger");
      }
      setLoading(false);
    }
  };

  const getFilteredLaporan = () => {
    let filtered = laporan;

    // Filter by date range
    if (filterTanggalMulai) {
      filtered = filtered.filter(row => dayjs(row.tanggal).isSameOrAfter(filterTanggalMulai, 'day'));
    }
    if (filterTanggalAkhir) {
      filtered = filtered.filter(row => dayjs(row.tanggal).isSameOrBefore(filterTanggalAkhir, 'day'));
    }

    // Filter by transaction type
    if (filterJenisTransaksi !== "all") {
      filtered = filtered.filter(row => {
        if (filterJenisTransaksi === "debet") return row.debet > 0;
        if (filterJenisTransaksi === "kredit") return row.kredit > 0;
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        row.sumber.toLowerCase().includes(lowerCaseSearchTerm) ||
        row.penggunaan.toLowerCase().includes(lowerCaseSearchTerm) ||
        row.ket.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    return filtered;
  };

  const filteredLaporan = getFilteredLaporan();

  const totalDebet = filteredLaporan.reduce((sum, row) => sum + (row.debet ?? 0), 0);
  const totalKredit = filteredLaporan.reduce((sum, row) => sum + (row.kredit ?? 0), 0);
  const saldoAkhir = totalDebet - totalKredit;

  const handleResetFilters = () => {
    setFilterTanggalMulai("");
    setFilterTanggalAkhir("");
    setFilterJenisTransaksi("all");
    setSearchTerm("");
  };

  const exportToExcel = () => {
    if (filteredLaporan.length === 0) {
      setAlertMessage("Tidak ada data untuk diekspor!");
      setAlertColor("danger");
      return;
    }

    const dataForExport = filteredLaporan.map(row => ({
      "Tgl Transaksi": dayjs(row.tanggal).format("DD/MM/YYYY"),
      "Sumber Pemasukan": row.sumber,
      "Penggunaan": row.penggunaan,
      "Debet": row.debet ?? 0,
      "Kredit": row.kredit ?? 0,
      "Jumlah": row.jumlah ?? 0,
      "Ket": row.ket,
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Keuangan");

    // Generate file and download
    XLSX.writeFile(wb, `laporan_keuangan_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);

    setAlertMessage("Data berhasil diekspor ke Excel!");
    setAlertColor("success");
  };

  return (
    <div className="space-y-8 w-full">
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <Alert color={alertColor} title={alertMessage} onClose={() => setShowAlert(false)} />
        </div>
      )}

      {/* Toggle Form Button */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setShowForm(!showForm)}
          color="secondary"
          variant="flat"
          startContent={showForm ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        >
          {showForm ? "Sembunyikan Form" : "Tampilkan Form Input"}
        </Button>
      </div>

      {/* Form Section */}
      {showForm && (
        <Card className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-fade-in">
          <h2 className="font-semibold text-xl mb-4 text-gray-900 dark:text-gray-100">
            {isEditing ? "Edit Data Keuangan" : "Tambah Data Keuangan Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Input
                label="Tgl Transaksi"
                name="tanggal"
                type="date"
                value={form.tanggal}
                onChange={handleChange}
                required
                className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
              />
              <Input
                label="Sumber Pemasukan"
                name="sumber"
                value={form.sumber}
                onChange={handleChange}
                className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
              />
              <Input
                label="Penggunaan"
                name="penggunaan"
                value={form.penggunaan}
                onChange={handleChange}
                className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
              />
              <Select
                label="Jenis Transaksi"
                name="jenisTransaksi"
                selectedKeys={[form.jenisTransaksi]}
                onChange={handleSelectChange}
                className="w-full"
              >
                <SelectItem key="debet">Pemasukan (Debet)</SelectItem>
                <SelectItem key="kredit">Pengeluaran (Kredit)</SelectItem>
              </Select>
              <Input
                label="Jumlah"
                name="jumlah"
                type="text"
                value={formatRupiah(form.jumlah)}
                onChange={handleJumlahChange}
                required
                className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Keterangan
                </label>
                <textarea
                  name="ket"
                  value={form.ket}
                  onChange={handleChange}
                  rows={2}
                  className="input input-bordered w-full text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <div className="flex justify-end space-x-2">
              {isEditing && (
                <Button
                  type="button"
                  color="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setForm({
                      _id: "", tanggal: "", sumber: "", penggunaan: "",
                      jenisTransaksi: "debet", jumlah: "", ket: "",
                    });
                  }}
                  className="text-base md:text-lg py-2 px-4"
                >
                  Batal Edit
                </Button>
              )}
              <Button
                type="submit"
                color="primary"
                isLoading={loading}
                className="text-base md:text-lg py-2 px-4"
              >
                {isEditing ? "Update Data" : "Simpan Data"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Laporan Keuangan Section */}
      <Card className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-xl mb-4 text-gray-900 dark:text-gray-100">
          Laporan Keuangan
        </h2>

        {/* Filter and Search Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            label="Tanggal Mulai"
            type="date"
            value={filterTanggalMulai}
            onChange={(e) => setFilterTanggalMulai(e.target.value)}
            className="text-base w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
          />
          <Input
            label="Tanggal Akhir"
            type="date"
            value={filterTanggalAkhir}
            onChange={(e) => setFilterTanggalAkhir(e.target.value)}
            className="text-base w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
          />
          <Select
            label="Jenis Transaksi"
            selectedKeys={[filterJenisTransaksi]}
            onChange={(e) => setFilterJenisTransaksi(e.target.value)}
            className="w-full"
          >
            <SelectItem key="all">Semua</SelectItem>
            <SelectItem key="debet">Pemasukan (Debet)</SelectItem>
            <SelectItem key="kredit">Pengeluaran (Kredit)</SelectItem>
          </Select>
          <div className="md:col-span-3 flex flex-col sm:flex-row gap-4">
            <Input
              label="Cari (Sumber, Penggunaan, Keterangan)"
              type="text"
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-base w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            />
            <div className="flex gap-2">
              <Button
                color="secondary"
                variant="flat"
                onClick={handleResetFilters}
                className="text-base py-2 px-4"
              >
                Reset Filter
              </Button>
              <Button
                color="success"
                startContent={<FileSpreadsheet size={20} />}
                onClick={exportToExcel} // Changed function call
                className="text-base py-2 px-4"
              >
                Export Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Total Saldo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-gray-900 dark:text-gray-100">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
            <h3 className="font-semibold text-sm mb-1">Total Pemasukan (Debet)</h3>
            <p className="text-xl font-bold text-green-600">{formatRupiah(totalDebet)}</p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
            <h3 className="font-semibold text-sm mb-1">Total Pengeluaran (Kredit)</h3>
            <p className="text-xl font-bold text-red-600">{formatRupiah(totalKredit)}</p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
            <h3 className="font-semibold text-sm mb-1">Saldo Akhir</h3>
            <p className={`text-xl font-bold ${saldoAkhir >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatRupiah(saldoAkhir)}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isFetchingLaporan ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Memuat data laporan...
            </div>
          ) : filteredLaporan.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Tidak ada data yang ditemukan.
            </div>
          ) : (
            <table className="min-w-full text-sm md:text-base border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-900">
                  <th className="px-3 py-2 border-b text-left">Tanggal</th>
                  <th className="px-3 py-2 border-b text-left">Sumber</th>
                  <th className="px-3 py-2 border-b text-left">Penggunaan</th>
                  <th className="px-3 py-2 border-b text-right">Debet</th>
                  <th className="px-3 py-2 border-b text-right">Kredit</th>
                  <th className="px-3 py-2 border-b text-right">Jumlah</th>
                  <th className="px-3 py-2 border-b text-left">Keterangan</th>
                  <th className="px-3 py-2 border-b text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredLaporan.map((row) => (
                  <tr
                    key={row._id}
                    className="even:bg-gray-50 dark:even:bg-gray-900"
                  >
                    <td className="px-3 py-2 border-b">
                      {dayjs(row.tanggal).format("DD/MM/YYYY")}
                    </td>
                    <td className="px-3 py-2 border-b">{row.sumber}</td>
                    <td className="px-3 py-2 border-b">{row.penggunaan}</td>
                    <td className="px-3 py-2 border-b text-right">
                      {formatRupiah(row.debet)}
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {formatRupiah(row.kredit)}
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {formatRupiah(row.jumlah)}
                    </td>
                    <td className="px-3 py-2 border-b">{row.ket}</td>
                    <td className="px-3 py-2 border-b text-center">
                      <div className="flex items-center justify-center space-x-2">
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
