// app/components/admin/SekolahDataAdmin.tsx
"use client";

import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Spinner,
  Alert,
  Chip,
} from "@heroui/react";
import { useEffect, useMemo, useState, useRef, useCallback } from "react"; // Import useCallback
import { StarIcon, ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation';
import { Trash2, Edit } from "lucide-react";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ReadonlyURLSearchParams } from "next/navigation";

function SekolahDataAdmin({ searchParams }: { searchParams: ReadonlyURLSearchParams }) {
  const [sekolahData, setSekolahData] = useState<any>({ data: [], total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<any | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColor, setAlertColor] = useState<"success" | "danger">("success");

  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [kecamatanSearchTerm, setKecamatanSearchTerm] = useState<string>("");
  const [debouncedKecamatanSearchTerm, setDebouncedKecamatanSearchTerm] = useState<string>("");
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<string | undefined>(undefined);
  const [showKecamatanSuggestions, setShowKecamatanSuggestions] = useState(false);
  const kecamatanSearchRef = useRef<HTMLDivElement>(null);

  // Load awal dari URL search params
  useEffect(() => {
    const initialKecId = searchParams.get('kecamatan_id');
    if (initialKecId && !initialKecId.includes('[object Set]')) {
      setSelectedKecamatanId(initialKecId);
    } else if (initialKecId && initialKecId.includes('[object Set]')) {
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

        if (selectedKecamatanId) {
          const foundKecamatan = mappedKecamatan.find((k: any) => k._id === selectedKecamatanId);
          if (foundKecamatan) {
            setKecamatanSearchTerm(foundKecamatan.kecamatan);
            setDebouncedKecamatanSearchTerm(foundKecamatan.kecamatan);
          }
        }
      } catch (error) {
        console.error("Error fetching kecamatan list:", error);
        setAlertMessage("Gagal memuat daftar kecamatan.");
        setAlertColor("danger");
      }
    };
    fetchKecamatan();
  }, [selectedKecamatanId]);

  // Efek Debounce untuk term pencarian kecamatan
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKecamatanSearchTerm(kecamatanSearchTerm);
    }, 500);

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
    setSelectedKecamatanId(undefined);
  };

  const handleKecamatanSelect = (item: any) => {
    setSelectedKecamatanId(item._id);
    setKecamatanSearchTerm(item.kecamatan);
    setDebouncedKecamatanSearchTerm(item.kecamatan);
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
    setDebouncedKecamatanSearchTerm("");
    setShowKecamatanSuggestions(false);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete('kecamatan_id');
    router.push(`${window.location.pathname}?${newSearchParams.toString()}`);
  };

  // Fungsi untuk menentukan status_sp berdasarkan tanggal_sp
  const getStatusSP = (tanggal_sp: string) => {
    if (!tanggal_sp) return 'Tidak Aktif';
    const today = dayjs();
    const expiryDate = dayjs(tanggal_sp);
    return expiryDate.isAfter(today) ? 'Aktif' : 'Tidak Aktif';
  };

  const sortedData = useMemo(() => {
    const dataToFilter = Array.isArray(sekolahData.data) ? sekolahData.data : [];

    return dataToFilter.filter((sekolah: any) =>
      sekolah.sekolah_maarif && sekolah.sekolah_maarif.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, sekolahData]);

  const displayData = useMemo(() => {
    return sortedData;
  }, [sortedData]);

  // FIX: Wrap refetchData in useCallback
  const refetchData = useCallback(() => {
    setIsLoading(true);
    let apiUrl = `/api/sekolahAdmin`; // Endpoint API untuk sekolah
    const params = new URLSearchParams();

    if (selectedKecamatanId) {
      params.set('kecamatan_id', selectedKecamatanId);
    } else if (debouncedKecamatanSearchTerm) {
      params.set('search_kecamatan', debouncedKecamatanSearchTerm);
    }

    if (params.toString()) {
      apiUrl += `?${params.toString()}`;
    }

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        setSekolahData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error refetching data:", error);
        setSekolahData({ data: [], total: 0 });
        setIsLoading(false);
        setAlertMessage("Gagal memuat data Komisariat/Sekolah.");
        setAlertColor("danger");
      });
  }, [selectedKecamatanId, debouncedKecamatanSearchTerm]); // Dependencies for useCallback

  useEffect(() => {
    refetchData();
  }, [selectedKecamatanId, debouncedKecamatanSearchTerm, refetchData]);

  const handleEdit = (sekolah: any) => {
    setEditingRowId(sekolah._id);
    setEditedData({
      ...sekolah,
      // Format tanggal_sp untuk input type="date"
      tanggal_sp: sekolah.tanggal_sp ? dayjs(sekolah.tanggal_sp).format('YYYY-MM-DD') : '',
    });
  };

  const handleSave = async (sekolahId: string) => {
    try {
      const response = await fetch(`/api/sekolahAdmin/${sekolahId}`, { // Endpoint API untuk sekolah
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // status_sp tidak lagi dikirim karena diturunkan
          tanggal_sp: editedData?.tanggal_sp, // Kirim sebagai string (format YYYY-MM-DD)
          nomor_sp: editedData?.nomor_sp,
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

  const handleDelete = async (sekolahId: string) => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus data Komisariat/Sekolah ini?");
    if (isConfirmed) {
      try {
        const response = await fetch(`/api/sekolahAdmin/${sekolahId}`, { // Endpoint API untuk sekolah
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
    const dataToExport = displayData.map((sekolah: any, index: number) => ({
      'No.': index + 1,
      'Nama Komisariat/Sekolah': sekolah.sekolah_maarif || '-',
      'Kecamatan': sekolah.kecamatan_id?.kecamatan || '-',
      'Status SP': getStatusSP(sekolah.tanggal_sp), // Derivasi status_sp untuk ekspor
      'Tanggal SP': sekolah.tanggal_sp || '-',
      'Nomor SP': sekolah.nomor_sp || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Komisariat/Sekolah");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `Data Komisariat-Sekolah - ${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  const colSpanCount = 7; // Sesuaikan dengan jumlah kolom di tabel Anda

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
          placeholder="Cari Komisariat/Sekolah..."
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
        <Table aria-label="Tabel Data Komisariat/Sekolah">
          <TableHeader>
            <TableColumn className="w-16 text-center">No.</TableColumn>
            <TableColumn className="w-64">Nama Komisariat/Sekolah</TableColumn>
            <TableColumn className="w-48">Kecamatan</TableColumn>
            <TableColumn className="w-32 text-center">Status SP</TableColumn>
            <TableColumn className="w-32 text-center">Tanggal SP</TableColumn>
            <TableColumn className="w-32">Nomor SP</TableColumn>
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
              displayData.map((sekolah: any, index: number) => (
                <TableRow key={sekolah._id}>
                  <TableCell className="text-center py-2">{index + 1}.</TableCell>
                  <TableCell className="py-2">{sekolah.sekolah_maarif}</TableCell>
                  <TableCell className="py-2">{sekolah.kecamatan_id?.kecamatan || '-'}</TableCell>
                  <TableCell className="text-center py-2">
                    <Chip color={getStatusSP(sekolah.tanggal_sp) === 'Aktif' ? 'success' : 'danger'}>
                      {getStatusSP(sekolah.tanggal_sp)}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-center py-2">
                    {editingRowId === sekolah._id ? (
                      <Input
                        type="date"
                        value={editedData?.tanggal_sp || ''}
                        onChange={(e) => setEditedData({ ...editedData, tanggal_sp: e.target.value })}
                        className="w-full"
                      />
                    ) : (
                      sekolah.tanggal_sp ? dayjs(sekolah.tanggal_sp).format('DD MMMMYYYY') : '-'
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    {editingRowId === sekolah._id ? (
                      <Input
                        type="text"
                        value={editedData?.nomor_sp || ''}
                        onChange={(e) => setEditedData({ ...editedData, nomor_sp: e.target.value })}
                        className="w-full"
                      />
                    ) : (
                      sekolah.nomor_sp || '-'
                    )}
                  </TableCell>
                  <TableCell className="text-center py-2">
                    <div className="flex gap-2 justify-center">
                      {editingRowId === sekolah._id ? (
                        <>
                          <Button
                            size="sm"
                            color="success"
                            onClick={() => handleSave(sekolah._id)}
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
                            onClick={() => handleEdit(sekolah)}
                            startContent={<Edit size={16} />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            onClick={() => handleDelete(sekolah._id)}
                            startContent={<Trash2 size={16} />}
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

export default SekolahDataAdmin;
