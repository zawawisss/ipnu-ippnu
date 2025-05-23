// PACTableAdmin.tsx
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
} from "@heroui/react"; // Pagination dihapus dari import
import { useEffect, useMemo, useState } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation';

// Komponen PACTableAdmin khusus untuk halaman admin
function PACTableAdmin() {
  // Data kecamatan akan berisi semua data, tidak lagi paginated dari API
  const [kecamatanData, setKecamatanData] = useState<any>({ data: [], total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // currentPage dan rowsPerPage dihapus karena tidak ada pagination
  const router = useRouter();

  // State untuk melacak baris mana yang sedang diedit
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  // State untuk menyimpan data yang sedang diedit sementara
  const [editedData, setEditedData] = useState<any | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // Tidak perlu reset currentPage karena tidak ada pagination
  };

  const getStatus = (kec: any) => {
    if (!kec.tanggal_berakhir) return "";
    const endDate = new Date(kec.tanggal_berakhir);
    const twoWeeksBefore = new Date(
      endDate.getTime() - 14 * 24 * 60 * 60 * 1000
    );
    const now = new Date();

    if (now < twoWeeksBefore) {
      return "Aktif";
    } else if (now < endDate) {
      return "Hampir Berakhir";
    } else {
      return "Tidak Aktif";
    }
  };

  const sortedData = useMemo(() => {
    // --- PERBAIKAN DI SINI: Pastikan kecamatanData.data adalah array sebelum memanggil filter ---
    const dataToFilter = Array.isArray(kecamatanData.data) ? kecamatanData.data : [];

    const filtered = dataToFilter.filter((kec: any) =>
      kec.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const order: { [key: string]: number } = {
      "Aktif": 0,
      "Hampir Berakhir": 1,
      "Tidak Aktif": 2,
    };
    return filtered.sort((a: any, b: any) => {
      const statusA = getStatus(a) || "";
      const statusB = getStatus(b) || "";
      const rankA = order[statusA] !== undefined ? order[statusA] : 3;
      const rankB = order[statusB] !== undefined ? order[statusB] : 3;
      return rankA - rankB;
    });
  }, [searchTerm, kecamatanData]);

  // paginatedData sekarang hanya sortedData karena tidak ada paginasi
  const displayData = useMemo(() => {
    return sortedData;
  }, [sortedData]);

  // Fungsi untuk memuat ulang data dari API (semua data)
  const refetchData = () => {
    setIsLoading(true);
    // Mengambil semua data tanpa parameter paginasi
    fetch(`/api/kecamatanList`) // Asumsi API ini mengembalikan semua data jika tanpa page/limit
      .then((res) => res.json())
      .then((data) => {
        // --- PERBAIKAN DI SINI: Asumsikan API mengembalikan objek { data: array, total: number } ---
        // Set state langsung dengan objek yang diterima dari API
        setKecamatanData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error refetching data:", error);
        setKecamatanData({ data: [], total: 0 }); // Pastikan state direset jika ada error
        setIsLoading(false);
      });
  };

  useEffect(() => {
    refetchData(); // Panggil refetchData saat komponen dimuat
  }, []); // Dependency array kosong agar hanya fetch sekali saat mount

  const handleRowClick = (kecId: string) => {
    if (editingRowId !== kecId) {
      router.push(`/kecamatan/${kecId}`);
    }
  };

  // handleRowsPerPageChange dihapus karena tidak ada pagination

  // Fungsi untuk memulai mode edit pada baris tertentu
  const handleEdit = (kec: any) => {
    setEditingRowId(kec._id);
    setEditedData({ ...kec });
  };

  // Fungsi untuk menyimpan perubahan data ke API
  const handleSave = async (kecId: string) => {
    try {
      const response = await fetch(`/api/kecamatan/${kecId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan data.');
      }

      alert('Data berhasil disimpan!');
      setEditingRowId(null);
      setEditedData(null);
      refetchData(); // Muat ulang data tabel setelah berhasil disimpan
    } catch (error: any) {
      console.error("Error saving data:", error);
      alert(`Gagal menyimpan data: ${error.message}`);
    }
  };

  // Fungsi untuk membatalkan pengeditan
  const handleCancel = () => {
    setEditingRowId(null);
    setEditedData(null);
  };

  // Fungsi untuk menghapus data dari API
  const handleDelete = async (kecId: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Kecamatan ini?`)) {
      try {
        const response = await fetch(`/api/kecamatan/${kecId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menghapus data.');
        }

        alert('Data berhasil dihapus!');
        refetchData(); // Muat ulang data tabel setelah berhasil dihapus
      } catch (error: any) {
        console.error("Error deleting data:", error);
        alert(`Gagal menghapus data: ${error.message}`);
      }
    }
  };

  const colSpanCount = 9; // Tetap 9 karena kolom Aksi selalu ada di admin

  return (
    <div className="space-y-4">
      {/* Bagian kontrol pencarian */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Input
          type="text"
          placeholder="Cari Kecamatan..."
          value={searchTerm}
          onChange={handleSearchChange}
          startContent={<StarIcon className="w-5 h-5 text-gray-400" />}
          className="w-full sm:w-64"
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            {displayData.length} data ditemukan {/* Menggunakan displayData.length */}
          </div>
          {/* Dropdown "Per Halaman" dihapus karena tidak ada pagination */}
        </div>
      </div>

      {/* Kontainer tabel */}
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
                  {searchTerm ? "Data tidak ditemukan" : "Tidak ada data"}
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((kec: any, i: number) => (
                <TableRow
                  key={kec._id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleRowClick(kec._id)}
                >
                  <TableCell className="text-center">
                    {i + 1} {/* Nomor urut sederhana karena tidak ada paginasi */}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {editingRowId === kec._id ? (
                      <Input
                        type="text"
                        value={editedData?.kecamatan || ''}
                        onChange={(e) => setEditedData({ ...editedData, kecamatan: e.target.value })}
                        size="sm"
                      />
                    ) : (
                      kec.kecamatan
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {(() => {
                      if (!kec.tanggal_berakhir) return "-";
                      const endDate = new Date(kec.tanggal_berakhir);
                      const twoWeeksBefore = new Date(
                        endDate.getTime() - 14 * 24 * 60 * 60 * 1000
                      );
                      const now = new Date();
                      if (now < twoWeeksBefore) {
                        return (
                          <Chip color="success" variant="dot" size="sm">
                            Aktif
                          </Chip>
                        );
                      } else if (now < endDate) {
                        return (
                          <Chip color="warning" variant="dot" size="sm">
                            Hampir Berakhir
                          </Chip>
                        );
                      } else {
                        return (
                          <Chip color="danger" variant="dot" size="sm">
                            Tidak Aktif
                          </Chip>
                        );
                      }
                    })() || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingRowId === kec._id ? (
                      <Input
                        type="date"
                        value={editedData?.tanggal_berakhir ? new Date(editedData.tanggal_berakhir).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditedData({ ...editedData, tanggal_berakhir: e.target.value })}
                        size="sm"
                      />
                    ) : (
                      kec.tanggal_berakhir
                        ? new Date(kec.tanggal_berakhir).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingRowId === kec._id ? (
                      <Input
                        type="text"
                        value={editedData?.nomor_sp || ''}
                        onChange={(e) => setEditedData({ ...editedData, nomor_sp: e.target.value })}
                        size="sm"
                      />
                    ) : (
                      kec.nomor_sp || "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingRowId === kec._id ? (
                      <Input
                        type="number"
                        value={editedData?.jumlah_desa || ''}
                        onChange={(e) => setEditedData({ ...editedData, jumlah_desa: parseInt(e.target.value) || 0 })}
                        size="sm"
                      />
                    ) : (
                      kec.jumlah_desa || "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingRowId === kec._id ? (
                      <Input
                        type="number"
                        value={editedData?.jumlah_ranting || ''}
                        onChange={(e) => setEditedData({ ...editedData, jumlah_ranting: parseInt(e.target.value) || 0 })}
                        size="sm"
                      />
                    ) : (
                      kec.jumlah_ranting || "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingRowId === kec._id ? (
                      <Input
                        type="number"
                        value={editedData?.jumlah_komisariat || ''}
                        onChange={(e) => setEditedData({ ...editedData, jumlah_komisariat: parseInt(e.target.value) || 0 })}
                        size="sm"
                      />
                    ) : (
                      kec.jumlah_komisariat || "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
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
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            onClick={(e) => { e.stopPropagation(); handleDelete(kec._id); }}
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

      {/* Pagination dihapus karena tidak ada pagination */}
      {/* {!isLoading && kecamatanData.total > 0 && (
        <div className="flex justify-center">
          <Pagination
            total={Math.ceil(kecamatanData.total / rowsPerPage)}
            initialPage={currentPage}
            onChange={setCurrentPage}
            showControls
            showShadow
          />
        </div>
      )} */}
    </div>
  );
}

export default PACTableAdmin;
