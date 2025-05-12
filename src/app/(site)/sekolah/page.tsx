"use client";
import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';

interface Sekolah {
  _id: string;
  kecamatan_id: string; // Assuming ObjectId can be treated as string for display
  sekolah_maarif: string;
  status_sp: string;
  tanggal_sp: string;
}

function SekolahPage() {
  const [sekolahData, setSekolahData] = useState<Sekolah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sekolah');
        if (!response.ok) {
          throw new Error(`Failed to fetch sekolah data: ${response.status}`);
        }
        const data = await response.json();
        setSekolahData(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Loading Sekolah data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  const columns = [
    { key: 'sekolah_maarif', label: 'Sekolah Ma\'arif' },
    { key: 'status_sp', label: 'Status SP' },
    { key: 'tanggal_sp', label: 'Tanggal SP' },
    // Add kecamatan_id column if needed
    // { key: 'kecamatan_id', label: 'Kecamatan ID' },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">Data Sekolah</h1>
      {sekolahData.length === 0 ? (
        <p>No Sekolah data available.</p>
      ) : (
        <div className="w-full max-w-4xl"> {/* Add a container for the table */}
          <Table aria-label="Table of Sekolah data">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={sekolahData}>
              {(item) => (
                <TableRow key={item._id}>
                  {(columnKey) => (
                    <TableCell>
                       {columnKey === 'tanggal_sp'
                        ? item[columnKey] ? new Date(item[columnKey]).toLocaleDateString() : '-'
                        : item[columnKey as keyof Sekolah]}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default SekolahPage;
