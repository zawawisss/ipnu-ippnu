'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface ArsipMasuk {
  _id: string;
  no: number;
  nomor_surat: string;
  pengirim: string;
  perihal: string;
  tanggal_surat: string;
}

const EditArsipSuratMasukPage = () => {
  const router = useRouter();
  const params = useParams(); // Get the entire params object
  const id = params?.id; // Safely access id, which can be string or string[]

  const [suratMasuk, setSuratMasuk] = useState<ArsipMasuk | null>(null);

  useEffect(() => {
    const fetchSuratMasuk = async () => {
      // Ensure id is a string before fetching
      if (typeof id === 'string') {
        try {
          const res = await fetch(`/api/admin/arsipmasuk/${id}`);
          if (!res.ok) {
            throw new Error(`Error fetching data: ${res.statusText}`);
          }
          const data: ArsipMasuk = await res.json();
          setSuratMasuk(data);
        } catch (err: any) {
          console.error('Failed to fetch arsip masuk:', err);
        }
      }
    };

    fetchSuratMasuk();
  }, [id]); // Depend on id

  if (!suratMasuk) {
    return <div>Loading...</div>;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setSuratMasuk({
      ...suratMasuk,
      [field]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure id is a string before submitting
    if (typeof id !== 'string') {
      console.error('ID is not a valid string for update.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/arsipmasuk/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(suratMasuk),
      });

      if (res.ok) {
        router.push('/admin_ipnu/surat/arsip/masuk');
      } else {
        console.error('Failed to update data');
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  return (
    <div className='container mx-auto p-4 dark:text-gray-200'>
      <h1 className='text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200'>
        Edit Arsip Surat Masuk
      </h1>
      <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <label
            htmlFor='no'
            className='block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2'
          >
            No:
          </label>
          <input
            type='number'
            id='no'
            value={suratMasuk.no}
            onChange={e => handleChange(e, 'no')}
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
          />
        </div>
        <div className='mb-4'>
          <label
            htmlFor='nomor_surat'
            className='block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2'
          >
            Nomor Surat:
          </label>
          <input
            type='text'
            id='nomor_surat'
            value={suratMasuk.nomor_surat}
            onChange={e => handleChange(e, 'nomor_surat')}
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
          />
        </div>
        <div className='mb-4'>
          <label
            htmlFor='pengirim'
            className='block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2'
          >
            Pengirim:
          </label>
          <input
            type='text'
            id='pengirim'
            value={suratMasuk.pengirim}
            onChange={e => handleChange(e, 'pengirim')}
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
          />
        </div>
        <div className='mb-4'>
          <label
            htmlFor='perihal'
            className='block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2'
          >
            Perihal:
          </label>
          <input
            type='text'
            id='perihal'
            value={suratMasuk.perihal}
            onChange={e => handleChange(e, 'perihal')}
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
          />
        </div>
        <div className='mb-4'>
          <label
            htmlFor='tanggal_surat'
            className='block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2'
          >
            Tanggal Surat:
          </label>
          <input
            type='date'
            id='tanggal_surat'
            value={suratMasuk.tanggal_surat}
            onChange={e => handleChange(e, 'tanggal_surat')}
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
          />
        </div>
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
          type='submit'
        >
          Simpan
        </button>
      </form>
    </div>
  );
};

export default EditArsipSuratMasukPage;
