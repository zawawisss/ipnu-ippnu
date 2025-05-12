"use client";
import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';

interface Desa {
  _id: string;
  nama_desa: string;
  status_sp: string;
  tanggal_sp: string;
  nomor_sp: string;
  jumlah_anggota: number;
}

function DesaPage() {
  const [desaData, setDesaData] = useState<Desa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/desa');
        if (!response.ok) {
          throw new Error(`Failed to fetch desa data: ${response.status}`);
        }
        const data = await response.json();
        setDesaData(data);
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
        <p>Loading Desa data...</p>
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
    { key: 'nama_desa', label: 'Nama Desa' },
    { key: 'status_sp', label: 'Status SP' },
    { key: 'tanggal_sp', label: 'Tanggal SP' },
    { key: 'nomor_sp', label: 'Nomor SP' },
    { key: 'jumlah_anggota', label: 'Jumlah Anggota' },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">Data Desa</h1>
      {desaData.length === 0 ? (
        <p>No Desa data available.</p>
      ) : (
        <div className="w-full max-w-4xl"> {/* Add a container for the table */}
          <Table aria-label="Table of Desa data">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={desaData}>
              {(item) => (
                <TableRow key={item._id}>
                  {(columnKey) => (
                    <TableCell>
                      {columnKey === 'tanggal_sp'
                        ? item[columnKey] ? new Date(item[columnKey]).toLocaleDateString() : '-'
                        : item[columnKey as keyof Desa]}
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

export default DesaPage;
