"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner, Input } from '@heroui/react'; // Import Pagination, Spinner, Input
import dayjs from "dayjs"; // Import dayjs

interface Sekolah {
  _id: string;
  kecamatan_id: string; // Asumsi ObjectId dapat diperlakukan sebagai string untuk tampilan
  sekolah_maarif: string;
  status_sp: string;
  tanggal_sp: Date; // Diubah dari string menjadi Date
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

function SekolahPage() {
  const [sekolahData, setSekolahData] = useState<PaginatedResponse<Sekolah>>({ data: [], total: 0, page: 1, limit: 10 }); // Memperbarui tipe status dan nilai awal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Baris default per halaman
  const [searchTerm, setSearchTerm] = useState(''); // Menambahkan status istilah pencarian

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Mengambil data dengan parameter paginasi
        const response = await fetch(`/api/sekolah?page=${currentPage}&limit=${rowsPerPage}&search=${searchTerm}`); // Menambahkan parameter pencarian
        if (!response.ok) {
          throw new Error(`Failed to fetch sekolah data: ${response.status}`);
        }
        const data: PaginatedResponse<Sekolah> = await response.json();
        setSekolahData(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, rowsPerPage, searchTerm]); // Menambahkan dependensi

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Mengatur ulang ke halaman 1 saat pencarian
  };

  const columns = [
    { key: 'sekolah_maarif', label: 'Sekolah Ma\'arif' },
    { key: 'status_sp', label: 'Status SP' },
    { key: 'tanggal_sp', label: 'Tanggal SP' },
    // Menambahkan kolom kecamatan_id jika diperlukan
    // { key: 'kecamatan_id', label: 'Kecamatan ID' },
  ];

  // Menghitung total halaman untuk paginasi
  const totalPages = useMemo(() => {
    return Math.ceil(sekolahData.total / rowsPerPage);
  }, [sekolahData.total, rowsPerPage]);

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">Data Sekolah</h1>

      <div className="w-full max-w-4xl mb-4"> {/* Menambahkan input pencarian */}
        <Input
          type="text"
          placeholder="Cari Sekolah..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-24">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-24">
          <p className="text-red-500">Error: {error}</p>
        </div>
      ) : sekolahData.data.length === 0 ? ( // Mengakses properti data
        <p>No Sekolah data available.</p>
      ) : (
        <div className="w-full max-w-4xl">
          <Table aria-label="Table of Sekolah data">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={sekolahData.data}
              emptyContent="No Sekolah data available."
            >
              {(item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.sekolah_maarif}</TableCell>
                  <TableCell>{item.status_sp}</TableCell>
                  <TableCell>
                    {item.tanggal_sp
                      ? dayjs(item.tanggal_sp).format("DD MMMM YYYY") // Menggunakan dayjs untuk format tanggal
                      : "-"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Menambahkan Paginasi */}
          {sekolahData.total > 0 && (
            <div className="flex justify-center mt-4">
              <Pagination
                total={totalPages}
                initialPage={currentPage}
                onChange={setCurrentPage}
                showControls
                showShadow
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SekolahPage;

