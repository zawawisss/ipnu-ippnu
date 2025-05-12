"use client";
import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';

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

function AnggotaPage() {
  const [anggotaData, setAnggotaData] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/anggota');
        if (!response.ok) {
          throw new Error(`Failed to fetch anggota data: ${response.status}`);
        }
        const data = await response.json();
        setAnggotaData(data);
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
        <p>Loading Anggota data...</p>
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
    { key: 'nama_anggota', label: 'Nama Anggota' },
    { key: 'tempat_lahir', label: 'Tempat Lahir' },
    { key: 'tanggal_lahir', label: 'Tanggal Lahir' },
    { key: 'alamat', label: 'Alamat' },
    { key: 'pendidikan', label: 'Pendidikan' },
    { key: 'jabatan', label: 'Jabatan' },
    { key: 'pengkaderan', label: 'Pengkaderan' },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">Data Anggota</h1>
      {anggotaData.length === 0 ? (
        <p>No Anggota data available.</p>
      ) : (
        <div className="w-full max-w-4xl"> {/* Add a container for the table */}
          <Table aria-label="Table of Anggota data">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={anggotaData}>
              {(item) => (
                <TableRow key={item._id}>
                  {(columnKey) => (
                    <TableCell>
                      {item[columnKey as keyof Anggota]}
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

export default AnggotaPage;
