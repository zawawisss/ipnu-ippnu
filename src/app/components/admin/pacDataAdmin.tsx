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
  Select, // Import Select
  SelectItem, // Import SelectItem
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { StarIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline"; // Import ArrowDownTrayIcon
import { useRouter } from 'next/navigation';
import { Trash2, Edit } from "lucide-react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import * as XLSX from 'xlsx'; // Import xlsx
import { saveAs } from 'file-saver'; // Import saveAs

// Extend Day.js with the plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

function PACTableAdmin() {
  const [kecamatanData, setKecamatanData] = useState<any>({ data: [], total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<any | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColor, setAlertColor] = useState<"success" | "danger">("success");

  // --- PERUBAHAN BARU: State untuk filter status ---
  const [statusFilter, setStatusFilter] = useState<string>("all"); // 'all', 'Aktif', 'Hampir Berakhir', 'Tidak Aktif'

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

  const getStatus = (kec: any) => {
    if (!kec.tanggal_berakhir) return "";
    const endDate = dayjs(kec.tanggal_berakhir);
    const twoWeeksBefore = endDate.subtract(14, 'day');
    const now = dayjs();

    if (now.isBefore(twoWeeksBefore)) {
      return "Aktif";
    } else if (now.isBefore(endDate)) {
      return "Hampir Berakhir";
    } else {
      return "Tidak Aktif";
    }
  };

  const sortedData = useMemo(() => {
    const dataToFilter = Array.isArray(kecamatanData.data) ? kecamatanData.data : [];

    let filtered = dataToFilter.filter((kec: any) =>
      kec.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- PERUBAHAN BARU: Filter berdasarkan status ---
    if (statusFilter !== "all") {
      filtered = filtered.filter((kec: any) => getStatus(kec) === statusFilter);
    }

    const order: { [key: string]: number } = {
      "Hampir Berakhir": 0,
      "Aktif": 1,
      "Tidak Aktif": 2,
    };
    return filtered.sort((a: any, b: any) => {
      const statusA = getStatus(a) || "";
      const statusB = getStatus(b) || "";
      const rankA = order[statusA] !== undefined ? order[statusA] : 3;
      const rankB = order[statusB] !== undefined ? order[statusB] : 3;
      return rankA - rankB;
    });
  }, [searchTerm, kecamatanData, getStatus, statusFilter]); // Tambahkan statusFilter ke dependency array

  const displayData = useMemo(() => {
    return sortedData;
  }, [sortedData]);

  const refetchData = () => {
    setIsLoading(true);
    fetch(`/api/kecamatanList`)
      .then((res) => res.json())
      .then((data) => {
        setKecamatanData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error refetching data:", error);
        setKecamatanData({ data: [], total: 0 });
        setIsLoading(false);
        setAlertMessage("Gagal memuat data kecamatan.");
        setAlertColor("danger");
      });
  };

  useEffect(() => {
    refetchData();
  }, []);

  const handleRowClick = (kecId: string) => {
    if (editingRowId !== kecId) {
      router.push(`/kecamatan/${kecId}`);
    }
  };

  const handleEdit = (kec: any) => {
    setEditingRowId(kec._id);
    setEditedData({
      ...kec,
      tanggal_berakhir: kec.tanggal_berakhir ? dayjs(kec.tanggal_berakhir).format('DD-MM-YYYY') : '',
    });
  };

  const handleSave = async (kecId: string) => {
    try {
      const dataToSave = { ...editedData };
      if (dataToSave.tanggal_berakhir) {
        const parsedDate = dayjs(dataToSave.tanggal_berakhir, 'DD-MM-YYYY');
        if (parsedDate.isValid()) {
          dataToSave.tanggal_berakhir = parsedDate.format('YYYY-MM-DD');
        } else {
          setAlertMessage("Format tanggal Masa Khidmat tidak valid. Gunakan DD-MM-YYYY.");
          setAlertColor("danger");
          return;
        }
      } else {
        dataToSave.tanggal_berakhir = "";
      }

      const response = await fetch(`/api/kecamatan/${kecId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
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

  const handleDelete = async (kecId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus Kecamatan ini?")) {
      try {
        const response = await fetch(`/api/kecamatan/${kecId}`, {
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

  // --- PERUBAHAN BARU: Fungsi untuk ekspor ke Excel ---
  const handleExportToExcel = () => {
    const dataToExport = displayData.map((kec: any, index: number) => ({
      'No.': index + 1,
      'Kecamatan': kec.kecamatan || '-',
      'Status SP': getStatus(kec) || '-',
      'Masa Khidmat': kec.tanggal_berakhir ? dayjs(kec.tanggal_berakhir).format("DD MMMM YYYY") : '-',
      'Nomor SP': kec.nomor_sp || '-',
      'Jumlah Desa': kec.jumlah_desa || '-',
      'Jumlah Ranting': kec.jumlah_ranting || '-',
      'Jumlah Komisariat': kec.jumlah_komisariat || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Kecamatan");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `Data Kecamatan - ${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  const colSpanCount = 9;

  return (
    <div className="space-y-4">
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <Alert color={alertColor} title={alertMessage} onClose={() => setShowAlert(false)} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center"> {/* items-center untuk alignment */}
        <Input
          type="text"
          placeholder="Cari Kecamatan..."
          value={searchTerm}
          onChange={handleSearchChange}
          startContent={<StarIcon className="w-5 h-5 text-gray-400" />}
          className="w-full sm:w-64"
        />
        {/* --- PERUBAHAN BARU: Filter Status & Tombol Ekspor --- */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Select
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
            size="sm"
            labelPlacement="outside"
          >
            <SelectItem key="all">Semua Status</SelectItem>
            <SelectItem key="Aktif">Aktif</SelectItem>
            <SelectItem key="Hampir Berakhir">Hampir Berakhir</SelectItem>
            <SelectItem key="Tidak Aktif">Tidak Aktif</SelectItem>
          </Select>
          <Button
            color="secondary" // Warna tombol
            onClick={handleExportToExcel}
            startContent={<ArrowDownTrayIcon className="w-5 h-5" />} // Ikon Unduh
            className="w-full sm:w-auto"
          >
            Ekspor Excel
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table aria-label="Data PAC" className="min-w-full" isStriped>
          <TableHeader>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              #
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Kecamatan
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Status SP
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Masa Khidmat
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Nomor SP
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Jumlah Desa
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Ranting
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Komisariat
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Aksi
            </TableColumn>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={colSpanCount} className="text-center py-8">
                  <Spinner size="lg" />
                </TableCell>
              </TableRow>
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colSpanCount}
                  className="text-center py-8 text-gray-500"
                >
                  {searchTerm || statusFilter !== "all" ? "Data tidak ditemukan dengan kriteria tersebut" : "Tidak ada data"}
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((kec: any, i: number) => (
                <TableRow
                  key={kec._id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <TableCell className="text-center py-2">
                    {i + 1}
                  </TableCell>
                  <TableCell className="text-center font-medium py-2">
                    {editingRowId === kec._id ? (
                      <Input
                        type="text"
                        value={editedData?.kecamatan || ''}
                        onChange={(e) => setEditedData({ ...editedData, kecamatan: e.target.value })}
                        size="sm"
                        className="text-sm"
                      />
                    ) : (
                      kec.kecamatan
                    )}
                  </TableCell>
                  <TableCell className="text-center py-2">
                    {(() => {
                      const status = getStatus(kec);
                      let color: "success" | "warning" | "danger" = "success";
                      if (status === "Hampir Berakhir") color = "warning";
                      if (status === "Tidak Aktif") color = "danger";
                      return status ? (
                        <Chip color={color} variant="dot" size="sm">
                          {status}
                        </Chip>
                      ) : "-";
                    })()}
                  </TableCell>
                  <TableCell className="text-center py-2">
                    {editingRowId === kec._id ? (
                      <Input
                        type="text"
                        value={editedData?.tanggal_berakhir || ''}
                        onChange={(e) => setEditedData({ ...editedData, tanggal_berakhir: e.target.value })}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val && !dayjs(val, 'DD-MM-YYYY', true).isValid()) {
                            setAlertMessage("Format tanggal tidak valid. Gunakan DD-MM-YYYY.");
                            setAlertColor("danger");
                          } else if (alertMessage === "Format tanggal tidak valid. Gunakan DD-MM-YYYY.") {
                            setAlertMessage("");
                          }
                        }}
                        placeholder="DD-MM-YYYY"
                        size="sm"
                        className="text-sm"
                      />
                    ) : (
                      kec.tanggal_berakhir
                        ? dayjs(kec.tanggal_berakhir).format("DD MMMM YYYY")
                        : "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center py-2">
                    {editingRowId === kec._id ? (
                      <Input
                        type="text"
                        value={editedData?.nomor_sp || ''}
                        onChange={(e) => setEditedData({ ...editedData, nomor_sp: e.target.value })}
                        size="sm"
                        className="text-sm"
                      />
                    ) : (
                      kec.nomor_sp || "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center py-2">
                    {editingRowId === kec._id ? (
                      <Input
                        type="number"
                        value={editedData?.jumlah_desa !== undefined && editedData.jumlah_desa !== null ? editedData.jumlah_desa.toString() : ''}
                        onChange={(e) => setEditedData({ ...editedData, jumlah_desa: parseInt(e.target.value) || 0 })}
                        size="sm"
                        className="text-sm"
                      />
                    ) : (
                      kec.jumlah_desa || "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center py-2">
                    {editingRowId === kec._id ? (
                      <Input
                        type="number"
                        value={editedData?.jumlah_ranting !== undefined && editedData.jumlah_ranting !== null ? editedData.jumlah_ranting.toString() : ''}
                        onChange={(e) => setEditedData({ ...editedData, jumlah_ranting: parseInt(e.target.value) || 0 })}
                        size="sm"
                        className="text-sm"
                      />
                    ) : (
                      kec.jumlah_ranting || "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center py-2">
                    {editingRowId === kec._id ? (
                      <Input
                        type="number"
                        value={editedData?.jumlah_komisariat !== undefined && editedData.jumlah_komisariat !== null ? editedData.jumlah_komisariat.toString() : ''}
                        onChange={(e) => setEditedData({ ...editedData, jumlah_komisariat: parseInt(e.target.value) || 0 })}
                        size="sm"
                        className="text-sm"
                      />
                    ) : (
                      kec.jumlah_komisariat || "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center py-2">
                    <div className="flex gap-2 justify-center">
                      {editingRowId === kec._id ? (
                        <>
                          <Button
                            size="sm"
                            color="success"
                            onClick={(e) => { e.stopPropagation(); handleSave(kec._id); }}
                          >
                            Simpan
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                          >
                            Batal
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            color="primary"
                            onClick={(e) => { e.stopPropagation(); handleEdit(kec); }}
                            startContent={<Edit size={16} />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            onClick={(e) => { e.stopPropagation(); handleDelete(kec._id); }}
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

export default PACTableAdmin;
