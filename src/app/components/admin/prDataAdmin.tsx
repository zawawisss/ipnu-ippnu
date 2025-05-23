// app/components/admin/PRDataAdmin.tsx
"use client";

import {
  Button,
  Chip,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Spinner,
  Alert,
  Select, // Import Select component
  SelectItem, // Import SelectItem component
} from "@heroui/react";
import { useEffect, useMemo, useState, useRef, useCallback } from "react"; // Import useCallback
import { StarIcon, ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation';
import { Edit } from "lucide-react";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ReadonlyURLSearchParams } from "next/navigation";

function PRDataAdmin({ searchParams }: { searchParams: ReadonlyURLSearchParams }) {
  const [prData, setPRData] = useState<any>({ data: [], total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<any | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColor, setAlertColor] = useState<"success" | "danger">("success");

  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [kecamatanSearchTerm, setKecamatanSearchTerm] = useState<string>(""); // Nilai input live
  const [debouncedKecamatanSearchTerm, setDebouncedKecamatanSearchTerm] = useState<string>(""); // Nilai debounced untuk filter data utama
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<string | undefined>(undefined); // ID dari item yang dipilih secara eksplisit
  const [showKecamatanSuggestions, setShowKecamatanSuggestions] = useState(false);
  const kecamatanSearchRef = useRef<HTMLDivElement>(null);

  // Load awal dari URL search params
  useEffect(() => {
    const initialKecId = searchParams.get('kecamatan_id');
    if (initialKecId && !initialKecId.includes('[object Set]')) {
      setSelectedKecamatanId(initialKecId);
      // Akan mengatur `kecamatanSearchTerm` setelah `kecamatanList` dimuat
    } else if (initialKecId && initialKecId.includes('[object Set]')) {
      // Bersihkan parameter URL yang salah
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('kecamatan_id');
      router.replace(`${window.location.pathname}?${newSearchParams.toString()}`);
    }
  }, [searchParams, router]);

  // Ambil daftar kecamatan saat komponen dimuat
  useEffect(() => {
    const fetchKecamatan = async () => {
      try {
        const response = await fetch('/api/kecamatanList');
        if (!response.ok) {
          throw new Error('Failed to fetch kecamatan list');
        }
        const data = await response.json();
        const mappedKecamatan = data.data.map((item: any) => ({ ...item, nama_kecamatan: item.kecamatan })) || [];
        setKecamatanList(mappedKecamatan);

        // Setelah mengambil kecamatanList, jika ada selectedKecamatanId awal, atur nilai input
        if (selectedKecamatanId) {
          const foundKecamatan = mappedKecamatan.find((k: any) => k._id === selectedKecamatanId);
          if (foundKecamatan) {
            setKecamatanSearchTerm(foundKecamatan.kecamatan);
            setDebouncedKecamatanSearchTerm(foundKecamatan.kecamatan); // Juga atur term debounced
          }
        }
      } catch (error) {
        console.error("Error fetching kecamatan list:", error);
        setAlertMessage("Gagal memuat daftar kecamatan.");
        setAlertColor("danger");
      }
    };
    fetchKecamatan();
  }, [selectedKecamatanId]); // Bergantung pada selectedKecamatanId untuk mengatur nilai input dengan benar pada pemuatan awal

  // Efek Debounce untuk term pencarian kecamatan
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKecamatanSearchTerm(kecamatanSearchTerm);
    }, 500); // Penundaan debounce 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [kecamatanSearchTerm]);

  // Tangani klik di luar input pencarian untuk menyembunyikan saran
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (kecamatanSearchRef.current && !kecamatanSearchRef.current.contains(event.target as Node)) {
        setShowKecamatanSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [kecamatanSearchRef]);

  useEffect(() => {
    if (alertMessage) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
        setAlertMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleKecamatanInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setKecamatanSearchTerm(value);
    setShowKecamatanSuggestions(true);
    // Jika pengguna mulai mengetik, hapus pilihan eksplisit
    setSelectedKecamatanId(undefined);
  };

  const getStatusSP = (tanggal_sp: string) => {
      if (!tanggal_sp) return 'Tidak Aktif';
      const today = dayjs();
      const expiryDate = dayjs(tanggal_sp);
      return expiryDate.isAfter(today) ? 'Aktif' : 'Tidak Aktif';
    };

  const handleKecamatanSelect = (item: any) => {
    setSelectedKecamatanId(item._id);
    setKecamatanSearchTerm(item.kecamatan);
    setDebouncedKecamatanSearchTerm(item.kecamatan); // Segera perbarui term debounced saat dipilih
    setShowKecamatanSuggestions(false);

    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (item._id) {
      newSearchParams.set('kecamatan_id', item._id);
    } else {
      newSearchParams.delete('kecamatan_id');
    }
    router.push(`${window.location.pathname}?${newSearchParams.toString()}`);
  };

  const filteredKecamatanSuggestions = useMemo(() => {
    if (!kecamatanSearchTerm) {
      return kecamatanList;
    }
    return kecamatanList.filter(kecamatan =>
      kecamatan.kecamatan.toLowerCase().includes(kecamatanSearchTerm.toLowerCase())
    );
  }, [kecamatanSearchTerm, kecamatanList]);

  const handleClearKecamatanFilter = () => {
    setSelectedKecamatanId(undefined);
    setKecamatanSearchTerm("");
    setDebouncedKecamatanSearchTerm(""); // Bersihkan juga term debounced
    setShowKecamatanSuggestions(false);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete('kecamatan_id');
    router.push(`${window.location.pathname}?${newSearchParams.toString()}`);
  };

  const sortedData = useMemo(() => {
    const dataToFilter = Array.isArray(prData.data) ? prData.data : [];

    return dataToFilter.filter((pr: any) =>
      pr.nama_desa && pr.nama_desa.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, prData]);

  const displayData = useMemo(() => {
    return sortedData;
  }, [sortedData]);

  // FIX: Wrap refetchData in useCallback
  const refetchData = useCallback(() => {
    setIsLoading(true);
    let apiUrl = `/api/desaAdmin`;
    const params = new URLSearchParams();

    // Prioritaskan pilihan eksplisit, jika tidak gunakan term pencarian debounced
    if (selectedKecamatanId) {
      params.set('kecamatan_id', selectedKecamatanId);
    } else if (debouncedKecamatanSearchTerm) {
      // Jika tidak ada ID eksplisit yang dipilih, tetapi pengguna mengetik term pencarian, gunakan untuk filtering
      params.set('search_kecamatan', debouncedKecamatanSearchTerm);
    }

    if (params.toString()) {
      apiUrl += `?${params.toString()}`;
    }

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        setPRData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error refetching data:", error);
        setPRData({ data: [], total: 0 });
        setIsLoading(false);
        setAlertMessage("Gagal memuat data Desa.");
        setAlertColor("danger");
      });
  }, [selectedKecamatanId, debouncedKecamatanSearchTerm]); // Dependencies for useCallback

  useEffect(() => {
    refetchData();
  }, [selectedKecamatanId, debouncedKecamatanSearchTerm, refetchData]);

  const handleEdit = (pr: any) => {
    setEditingRowId(pr._id);
    // Saat memulai edit, pastikan editedData memiliki nilai yang sesuai
    setEditedData({
      ...pr,
      // Pastikan tanggal_sp diformat untuk input type="date"
      tanggal_sp: pr.tanggal_sp ? dayjs(pr.tanggal_sp).format('YYYY-MM-DD') : '',
      // Pastikan jumlah_anggota adalah angka atau string kosong jika null/undefined
      jumlah_anggota: pr.jumlah_anggota !== undefined && pr.jumlah_anggota !== null ? pr.jumlah_anggota : '',
    });
  };

  const handleSave = async (prId: string) => {
    try {
      const response = await fetch(`/api/desaAdmin/${prId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Hanya kirim field yang dapat diedit
          status_sp: editedData?.status_sp,
          tanggal_sp: editedData?.tanggal_sp,
          nomor_sp: editedData?.nomor_sp,
          // Pastikan jumlah_anggota adalah angka, default ke 0 jika tidak valid
          jumlah_anggota: typeof editedData?.jumlah_anggota === 'number' && !isNaN(editedData.jumlah_anggota) ? editedData.jumlah_anggota : (editedData?.jumlah_anggota === '' ? 0 : Number(editedData?.jumlah_anggota) || 0), // Handle empty string from input
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan data.');
      }

      setAlertMessage('Data berhasil disimpan!');
      setAlertColor('success');
      setEditingRowId(null);
      setEditedData(null);
      refetchData();
    } catch (error: any) {
      console.error("Error saving data:", error);
      setAlertMessage(`Gagal menyimpan data: ${error.message}`);
      setAlertColor('danger');
    }
  };

  const handleCancel = () => {
    setEditingRowId(null);
    setEditedData(null);
  };

  const handleDelete = async (prId: string) => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus data Desa ini?");
    if (isConfirmed) {
      try {
        const response = await fetch(`/api/desaAdmin/${prId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menghapus data.');
        }

        setAlertMessage('Data berhasil dihapus!');
        setAlertColor('success');
        refetchData();
      } catch (error: any) {
        console.error("Error deleting data:", error);
        setAlertMessage(`Gagal menghapus data: ${error.message}`);
        setAlertColor('danger');
      }
    }
  };

  const handleExportToExcel = () => {
    const dataToExport = displayData.map((pr: any, index: number) => ({
      'No.': index + 1,
      'Nama Desa': pr.nama_desa || '-',
      'Kecamatan': pr.kecamatan_id?.kecamatan || '-',
      'Status SP': getStatusSP(pr.tanggal_sp),
      'Tanggal SP': pr.tanggal_sp || '-',
      'Nomor SP': pr.nomor_sp || '-',
      'Jumlah Anggota': pr.jumlah_anggota || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Desa");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `Data Desa - ${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  const colSpanCount = 8; // Sesuaikan dengan jumlah kolom di tabel Anda

  return (
    <div className="space-y-4">
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <Alert color={alertColor} title={alertMessage} onClose={() => setShowAlert(false)} />
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <Input
          type="text"
          placeholder="Cari Desa..."
          value={searchTerm}
          onChange={handleSearchChange}
          startContent={<StarIcon className="w-5 h-5 text-gray-400" />}
          className="w-full sm:w-64"
        />
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64" ref={kecamatanSearchRef}>
            <Input
              type="text"
              placeholder="Filter Kecamatan..."
              value={kecamatanSearchTerm}
              onChange={handleKecamatanInputChange}
              onFocus={() => setShowKecamatanSuggestions(true)}
              startContent={<StarIcon className="w-5 h-5 text-gray-400" />}
            />
            {selectedKecamatanId && kecamatanSearchTerm && (
              <Button
                isIconOnly
                variant="light"
                onClick={handleClearKecamatanFilter}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            )}
            {showKecamatanSuggestions && filteredKecamatanSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {filteredKecamatanSuggestions.map((item) => (
                  <li
                    key={item._id}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleKecamatanSelect(item)}
                  >
                    {item.kecamatan}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            color="secondary"
            onClick={handleExportToExcel}
            startContent={<ArrowDownTrayIcon className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            Ekspor Excel
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table aria-label="Tabel Data Desa">
          <TableHeader>
            <TableColumn className="w-16 text-center">No.</TableColumn>
            <TableColumn className="w-64">Nama Desa</TableColumn>
            <TableColumn className="w-48">Kecamatan</TableColumn>
            <TableColumn className="w-32 text-center">Status SP</TableColumn>
            <TableColumn className="w-32 text-center">Tanggal SP</TableColumn>
            <TableColumn className="w-32">Nomor SP</TableColumn>
            <TableColumn className="w-32 text-center">Jumlah Anggota</TableColumn>
            <TableColumn className="w-48 text-center">Aksi</TableColumn>
          </TableHeader>
          <TableBody emptyContent={isLoading ? "Memuat data..." : "Tidak ada data."}>
            {isLoading ? (
              <TableRow key="loading">
                <TableCell colSpan={colSpanCount} className="text-center py-8">
                  <Spinner size="lg" />
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((pr: any, index: number) => (
                <TableRow key={pr._id}>
                  <TableCell className="text-center py-2">{index + 1}.</TableCell>
                  <TableCell className="py-2">{pr.nama_desa}</TableCell>
                  <TableCell className="py-2">{pr.kecamatan_id?.kecamatan || '-'}</TableCell>
                  <TableCell className="text-center py-2">
                    <Chip color={getStatusSP(pr.tanggal_sp) === 'Aktif' ? 'success' : 'danger'}>
                      {getStatusSP(pr.tanggal_sp)}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-center py-2">
                    {editingRowId === pr._id ? (
                      <Input
                        type="date"
                        value={editedData?.tanggal_sp || ''}
                        onChange={(e) => setEditedData({ ...editedData, tanggal_sp: e.target.value })}
                        className="w-full"
                      />
                    ) : (
                      pr.tanggal_sp ? dayjs(pr.tanggal_sp).format('DD MMMMYYYY') : '-'
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    {editingRowId === pr._id ? (
                      <Input
                        type="text"
                        value={editedData?.nomor_sp || ''}
                        onChange={(e) => setEditedData({ ...editedData, nomor_sp: e.target.value })}
                        className="w-full"
                      />
                    ) : (
                      pr.nomor_sp || '-'
                    )}
                  </TableCell>
                  <TableCell className="text-center py-2">
                    {editingRowId === pr._id ? (
                      <Input
                        type="number"
                        value={editedData?.jumlah_anggota || ''}
                        onChange={(e) => setEditedData({ ...editedData, jumlah_anggota: Number(e.target.value) })}
                        className="w-full"
                      />
                    ) : (
                      pr.jumlah_anggota || 0
                    )}
                  </TableCell>
                  <TableCell className="text-center py-2">
                    <div className="flex gap-2 justify-center">
                      {editingRowId === pr._id ? (
                        <>
                          <Button
                            size="sm"
                            color="success"
                            onClick={() => handleSave(pr._id)}
                          >
                            Simpan
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            onClick={handleCancel}
                          >
                            Batal
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            color="primary"
                            onClick={() => handleEdit(pr)}
                            startContent={<Edit size={16} />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            onClick={() => handleDelete(pr._id)}
                            startContent={<XMarkIcon className="w-5 h-5" />} // Changed to XMarkIcon for delete, if Trash2 is not desired
                          >
                            Hapus
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default PRDataAdmin;
