'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface ArsipKeluar {
  _id: string;
  no: number;
  indeks: string;
  nomor_surat: string;
  tujuan: string;
  perihal: string;
}

const EditArsipSuratKeluarPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [suratKeluar, setSuratKeluar] = useState<ArsipKeluar | null>(null);

  useEffect(() => {
    const fetchSuratKeluar = async () => {
      try {
        const res = await fetch(`/api/arsipkeluar/${id}`);
        if (!res.ok) {
          throw new Error(`Error fetching data: ${res.statusText}`);
        }
        const data: ArsipKeluar = await res.json();
        setSuratKeluar(data);
      } catch (err: any) {
        console.error('Failed to fetch arsip keluar:', err);
      }
    };

    fetchSuratKeluar();
  }, [id]);

  if (!suratKeluar) {
    return <div>Loading...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setSuratKeluar({
      ...suratKeluar,
      [field]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/arsipkeluar/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(suratKeluar),
      });

      if (res.ok) {
        router.push('/admin_ipnu/surat/arsip/keluar');
      } else {
        console.error('Failed to update data');
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Edit Arsip Surat Keluar</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="no" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            No:
          </label>
          <input
            type="number"
            id="no"
            value={suratKeluar.no}
            onChange={(e) => handleChange(e, 'no')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="indeks" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Indeks:
          </label>
          <input
            type="text"
            id="indeks"
            value={suratKeluar.indeks}
            onChange={(e) => handleChange(e, 'indeks')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="nomor_surat" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Nomor Surat:
          </label>
          <input
            type="text"
            id="nomor_surat"
            value={suratKeluar.nomor_surat}
            onChange={(e) => handleChange(e, 'nomor_surat')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="tujuan" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Tujuan:
          </label>
          <input
            type="text"
            id="tujuan"
            value={suratKeluar.tujuan}
            onChange={(e) => handleChange(e, 'tujuan')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="perihal" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Perihal:
          </label>
          <input
            type="text"
            id="perihal"
            value={suratKeluar.perihal}
            onChange={(e) => handleChange(e, 'perihal')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700"
          />
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Simpan
        </button>
      </form>
    </div>
  );
};

export default EditArsipSuratKeluarPage;