/**
 * v0 by Vercel.
 * @see https://v0.dev/t/H9K3sBwKn
 */

"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from "@heroui/react";
import { format } from 'date-fns';

// Function to convert Excel serial date to JavaScript Date object
function excelSerialDateToJSDate(serial: number): Date {
  const daysSinceEpoch = serial - 25569; // Days since 1970-01-01
  const ms = daysSinceEpoch * 24 * 60 * 60 * 1000;
  return new Date(ms);
}

function KaderisasiDetailPage() {
  const [kaderisasiData, setKaderisasiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchKaderisasiData() {
      try {
        const response = await fetch("/api/kaderisasi-detail");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setKaderisasiData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchKaderisasiData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading data...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  const columns = [
    { key: "TANGGAL", label: "Tanggal" },
    { key: "PENGKADERAN", label: "Pengkaderan" },
    { key: "PIMPINAN", label: "Pimpinan" },
    { key: "TEMPAT", label: "Tempat" },
    { key: "JUMLAH_GABUNGAN", label: "Peserta (IPNU & IPPNU)" },
    { key: "TOTAL_JUMLAH", label: "Total" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Detail Alumni MAKESTA</h1>
      <div className="overflow-x-auto">
        <Table
          aria-label="Tabel Detail Alumni MAKESTA"
          selectionMode="single"
          color="primary"
          className="min-w-full"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={kaderisasiData}>
            {(item: any) => (
              <TableRow key={item.id}>
                {(columnKey) => {
                  if (columnKey === "TANGGAL" && typeof item.TANGGAL === 'number') {
                    return <TableCell>{format(excelSerialDateToJSDate(item.TANGGAL), 'dd MMMM yyyy')}</TableCell>;
                  } else if (columnKey === "JUMLAH_GABUNGAN") {
                    return (
                      <TableCell>
                        <div>IPNU: {item.JUMLAH_IPNU || 0}</div>
                        <div>IPPNU: {item.JUMLAH_IPPNU || 0}</div>
                      </TableCell>
                    );
                  }
                  return <TableCell>{getKeyValue(item, columnKey)}</TableCell>;
                }}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default KaderisasiDetailPage;
