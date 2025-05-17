'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const TambahArsipSuratKeluarPage = () => {
  const [no, setNo] = useState('');
  const [indeks, setIndeks] = useState('');
  const [nomor_surat, setNomor_surat] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [perihal, setPerihal] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/arsipkeluar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          no,
          indeks,
          nomor_surat,
          tujuan,
          perihal,
        }),
      });

      if (res.ok) {
        // Reset form values
        setNo('');
        setIndeks('');
        setNomor_surat('');
        setTujuan('');
        setPerihal('');
        router.push('/admin_ipnu/surat/arsip/keluar');
      } else {
        console.error('Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Tambah Arsip Surat Keluar</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="no" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            No:
          </label>
          <input
            type="number"
            id="no"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700"
            value={no}
            onChange={(e) => setNo(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="indeks" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Indeks:
          </label>
          <input
            type="text"
            id="indeks"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700"
            value={indeks}
            onChange={(e) => setIndeks(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="nomor_surat" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Nomor Surat:
          </label>
          <input
            type="text"
            id="nomor_surat"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700"
            value={nomor_surat}
            onChange={(e) => setNomor_surat(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="tujuan" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Tujuan:
          </label>
          <input
            type="text"
            id="tujuan"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700"
            value={tujuan}
            onChange={(e) => setTujuan(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="perihal" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Perihal:
          </label>
          <input
            type="text"
            id="perihal"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700"
            value={perihal}
            onChange={(e) => setPerihal(e.target.value)}
          />
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Simpan
        </button>
      </form>
    </div>
  );
};

export default TambahArsipSuratKeluarPage;