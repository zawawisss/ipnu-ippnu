'use client';
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import Link from 'next/link';
import dayjs from 'dayjs'; // Import dayjs

interface Kecamatan {
  _id: string;
  id: number;
  kecamatan: string;
  status_sp: string;
  tanggal_sp: Date; // Diubah dari tanggal_berakhir menjadi tanggal_sp dengan tipe Date
  // Menambahkan bidang lain yang relevan dari model Kecamatan Anda jika diperlukan
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
        // Memastikan data yang diterima sesuai dengan struktur yang diharapkan
        setKecamatanData(data.data); // Asumsi API mengembalikan objek dengan properti `data`
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
      <div className='flex min-h-screen flex-col items-center justify-center p-24'>
        <p>Memuat data Kecamatan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center p-24'>
        <p className='text-red-500'>Error: {error}</p>
      </div>
    );
  }

  const columns = [
    { key: 'kecamatan', label: 'Nama Kecamatan' },
    { key: 'status_sp', label: 'Status SP' },
    { key: 'tanggal_sp', label: 'Tanggal SP' }, // Diubah dari Tanggal Berakhir menjadi Tanggal SP
  ];

  return (
    <div className='flex min-h-screen flex-col items-center p-8'>
      <h1 className='text-4xl font-bold mb-8'>Data Kecamatan</h1>
      {kecamatanData.length === 0 ? (
        <p>Tidak ada data Kecamatan yang tersedia.</p>
      ) : (
        <div className='w-full max-w-4xl'>
          {' '}
          {/* Menambahkan container untuk tabel */}
          <Table aria-label='Table of Kecamatan data'>
            <TableHeader columns={columns}>
              {column => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={kecamatanData}>
              {item => (
                <TableRow key={item._id}>
                  {columnKey => (
                    <TableCell>
                      {columnKey === 'tanggal_sp' ? ( // Diubah ke tanggal_sp
                        item.tanggal_sp ? (
                          dayjs(item.tanggal_sp).format('DD MMMM YYYY')
                        ) : (
                          '-'
                        ) // Mengakses langsung item.tanggal_sp dan format tanggal menggunakan dayjs
                      ) : columnKey === 'kecamatan' ? (
                        <Link href={`/kecamatan/${item._id}`}>
                          {item.kecamatan}
                        </Link> // Link ke halaman detail
                      ) : typeof item[columnKey as keyof Kecamatan] ===
                          'object' &&
                        item[columnKey as keyof Kecamatan] instanceof Date ? (
                        dayjs(
                          item[columnKey as keyof Kecamatan] as Date
                        ).format('DD MMMM YYYY')
                      ) : (
                        String(item[columnKey as keyof Kecamatan])
                      )}
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
