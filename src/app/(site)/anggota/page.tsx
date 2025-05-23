"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner, Input } from '@heroui/react'; // Import Pagination, Spinner, Input

interface Anggota {
  _id: string;
  nama_anggota: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  pendidikan: string;
  jabatan: string;
  pengkaderan: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

function AnggotaPage() {
  const [anggotaData, setAnggotaData] = useState<PaginatedResponse<Anggota>>({ data: [], total: 0, page: 1, limit: 10 }); // Update state type and initial value
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page
  const [searchTerm, setSearchTerm] = useState(''); // Add search term state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch data with pagination parameters
        const response = await fetch(`/api/anggota?page=${currentPage}&limit=${rowsPerPage}&search=${searchTerm}`); // Add search parameter
        if (!response.ok) {
          throw new Error(`Failed to fetch anggota data: ${response.status}`);
        }
        const data: PaginatedResponse<Anggota> = await response.json();
        setAnggotaData(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, rowsPerPage, searchTerm]); // Add dependencies

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const columns = [
    { key: 'nama_anggota', label: 'Nama Anggota' },
    { key: 'tempat_lahir', label: 'Tempat Lahir' },
    { key: 'tanggal_lahir', label: 'Tanggal Lahir' },
    { key: 'alamat', label: 'Alamat' },
    { key: 'pendidikan', label: 'Pendidikan' },
    { key: 'jabatan', label: 'Jabatan' },
    { key: 'pengkaderan', label: 'Pengkaderan' },
  ];

  // Calculate total pages for pagination
  const totalPages = useMemo(() => {
    return Math.ceil(anggotaData.total / rowsPerPage);
  }, [anggotaData.total, rowsPerPage]);

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">Data Anggota</h1>

      <div className="w-full max-w-4xl mb-4"> {/* Add search input */}
        <Input
          type="text"
          placeholder="Cari Anggota..."
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
      ) : anggotaData.data.length === 0 ? ( // Access data property
        <p>No Anggota data available.</p>
      ) : (
        <div className="w-full max-w-4xl">
          <Table aria-label="Table of Anggota data">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody 
              items={anggotaData.data} 
              emptyContent="No Anggota data available."
            >
              {(item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.nama_anggota}</TableCell>
                  <TableCell>{item.tempat_lahir}</TableCell>
                  <TableCell>{item.tanggal_lahir}</TableCell>
                  <TableCell>{item.alamat}</TableCell>
                  <TableCell>{item.pendidikan}</TableCell>
                  <TableCell>{item.jabatan}</TableCell>
                  <TableCell>{item.pengkaderan}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Add Pagination */}
          {anggotaData.total > 0 && (
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

export default AnggotaPage;