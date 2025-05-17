"use client";
"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner, Input } from '@heroui/react'; // Import Pagination, Spinner, Input

interface Sekolah {
  _id: string;
  kecamatan_id: string; // Assuming ObjectId can be treated as string for display
  sekolah_maarif: string;
  status_sp: string;
  tanggal_sp: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

function SekolahPage() {
  const [sekolahData, setSekolahData] = useState<PaginatedResponse<Sekolah>>({ data: [], total: 0, page: 1, limit: 10 }); // Update state type and initial value
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
        const response = await fetch(`/api/sekolah?page=${currentPage}&limit=${rowsPerPage}&search=${searchTerm}`); // Add search parameter
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
  }, [currentPage, rowsPerPage, searchTerm]); // Add dependencies

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const columns = [
    { key: 'sekolah_maarif', label: 'Sekolah Ma\'arif' },
    { key: 'status_sp', label: 'Status SP' },
    { key: 'tanggal_sp', label: 'Tanggal SP' },
    // Add kecamatan_id column if needed
    // { key: 'kecamatan_id', label: 'Kecamatan ID' },
  ];

  // Calculate total pages for pagination
  const totalPages = useMemo(() => {
    return Math.ceil(sekolahData.total / rowsPerPage);
  }, [sekolahData.total, rowsPerPage]);

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">Data Sekolah</h1>

      <div className="w-full max-w-4xl mb-4"> {/* Add search input */}
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
      ) : sekolahData.data.length === 0 ? ( // Access data property
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
                  <TableCell>{item.tanggal_sp}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Add Pagination */}
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
