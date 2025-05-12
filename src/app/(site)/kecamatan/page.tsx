"use client";
import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import Link from 'next/link';

interface Kecamatan {
  _id: string;
  id: number;
  kecamatan: string;
  status_sp: string;
  tanggal_berakhir: string;
  // Add other relevant fields from your Kecamatan model if needed
}

function KecamatanListPage() {
  const [kecamatanData, setKecamatanData] = useState<Kecamatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/kecamatanList');
        if (!response.ok) {
          throw new Error(`Failed to fetch kecamatan data: ${response.status}`);
        }
        const data = await response.json();
        setKecamatanData(data);
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
        <p>Loading Kecamatan data...</p>
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
    { key: 'id', label: 'ID' },
    { key: 'kecamatan', label: 'Nama Kecamatan' },
    { key: 'status_sp', label: 'Status SP' },
    { key: 'tanggal_berakhir', label: 'Tanggal Berakhir' },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">Data Kecamatan</h1>
      {kecamatanData.length === 0 ? (
        <p>No Kecamatan data available.</p>
      ) : (
        <div className="w-full max-w-4xl"> {/* Add a container for the table */}
          <Table aria-label="Table of Kecamatan data">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={kecamatanData}>
              {(item) => (
                <TableRow key={item._id}>
                  {(columnKey) => (
                    <TableCell>
                       {columnKey === 'tanggal_berakhir'
                        ? item[columnKey] ? new Date(item[columnKey]).toLocaleDateString() : '-'
                        : columnKey === 'kecamatan'
                          ? <Link href={`/kecamatan/${item._id}`}>{item[columnKey]}</Link> // Link to detail page
                          : item[columnKey as keyof Kecamatan]}
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

export default KecamatanListPage;
