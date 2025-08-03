'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'; // Added MagnifyingGlassIcon, PencilIcon, TrashIcon, PlusIcon

interface ArsipMasuk {
  _id: string;
  no: number;
  nomor_surat: string;
  pengirim: string;
  perihal: string;
  tanggal_surat: string;
  isEditing?: boolean;
}

const ArsipSuratMasukPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [arsipMasukData, setArsipMasukData] = useState<ArsipMasuk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newSurat, setNewSurat] = useState<Omit<ArsipMasuk, '_id'>>({
    no: 0,
    nomor_surat: '',
    pengirim: '',
    perihal: '',
    tanggal_surat: '',
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const fetchArsipMasuk = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(
            `/api/arsipmasuk?search=${encodeURIComponent(searchQuery)}`
          );
          if (!res.ok) {
            if (res.status === 401) {
              router.push('/login');
            }
            throw new Error(`Error fetching data: ${res.statusText}`);
          }
          const data = await res.json();
          setArsipMasukData(
            data.map((item: ArsipMasuk) => ({ ...item, isEditing: false }))
          );
        } catch (err: any) {
          setError(err.message);
          console.error('Failed to fetch arsip masuk:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchArsipMasuk();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [session, status, router, searchQuery]);

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/arsipmasuk?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(`Error deleting data: ${res.statusText}`);
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to delete arsip masuk:', err);
    }
  };

  const handleEdit = (id: string) => {
    setArsipMasukData(
      arsipMasukData.map(item =>
        item._id === id ? { ...item, isEditing: true } : item
      )
    );
  };

  const handleCancelEdit = (id: string) => {
    setArsipMasukData(
      arsipMasukData.map(item =>
        item._id === id ? { ...item, isEditing: false } : item
      )
    );
  };

  const handleSave = async (surat: ArsipMasuk) => {
    try {
      const res = await fetch(`/api/arsipmasuk/${surat._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surat),
      });

      if (res.ok) {
        setArsipMasukData(
          arsipMasukData.map(item =>
            item._id === surat._id ? { ...surat, isEditing: false } : item
          )
        );
      } else {
        console.error('Failed to update data');
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
    field: string
  ) => {
    setArsipMasukData(
      arsipMasukData.map(item =>
        item._id === id ? { ...item, [field]: e.target.value } : item
      )
    );
  };

  const handleAddInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setNewSurat({
      ...newSurat,
      [field]: e.target.value,
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/arsipmasuk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSurat),
      });

      if (res.ok) {
        setIsAdding(false);
        setNewSurat({
          no: 0,
          nomor_surat: '',
          pengirim: '',
          perihal: '',
          tanggal_surat: '',
        });
        router.refresh();
      } else {
        console.error('Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className='flex justify-center items-center h-screen dark:text-gray-200'>
        <ArrowPathIcon className='animate-spin h-8 w-8 mr-2' /> Loading
        session...
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center h-screen text-red-500 dark:text-red-400'>
        Error: {error}
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 dark:text-gray-200'>
      <h1 className='text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200'>
        Arsip Surat Masuk
      </h1>

      <div className='mb-4'>
        {!isAdding ? (
          <button
            onClick={e => {
              e.preventDefault();
              setIsAdding(true);
            }}
            className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
          >
            <PlusIcon className='h-5 w-5 mr-2 inline-block' /> Tambah
          </button>
        ) : (
          <button
            onClick={e => {
              e.preventDefault();
              setIsAdding(false);
            }}
            className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded'
          >
            Cancel
          </button>
        )}
      </div>

      <div className='mb-4'>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <MagnifyingGlassIcon className='h-5 w-5 text-gray-400 dark:text-gray-500' />
          </div>
          <input
            type='text'
            placeholder='Search...'
            value={searchQuery}
            onChange={handleSearchInputChange}
            className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm'
          />
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-64 dark:text-gray-200'>
          <ArrowPathIcon className='animate-spin h-8 w-8 mr-2' /> Loading
          data...
        </div>
      ) : arsipMasukData.length === 0 ? (
        <p className='text-gray-600 dark:text-gray-400'>
          Tidak ada data arsip surat masuk.
        </p>
      ) : (
        <div className='overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-50 dark:bg-gray-700'>
              <tr>
                <th
                  scope='col'
                  className='py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'
                >
                  No
                </th>
                <th
                  scope='col'
                  className='py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'
                >
                  Nomor Surat
                </th>
                <th
                  scope='col'
                  className='py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'
                >
                  Pengirim
                </th>
                <th
                  scope='col'
                  className='py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'
                >
                  Perihal
                </th>
                <th
                  scope='col'
                  className='py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'
                >
                  Tanggal Surat
                </th>
                <th
                  scope='col'
                  className='py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700'>
              {isAdding && (
                <tr className='bg-green-100 dark:bg-green-900'>
                  <td className='py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200'>
                    <input
                      type='number'
                      value={newSurat.no}
                      onChange={e => handleAddInputChange(e, 'no')}
                      className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
                    />
                  </td>
                  <td className='py-4 px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                    <input
                      type='text'
                      value={newSurat.nomor_surat}
                      onChange={e => handleAddInputChange(e, 'nomor_surat')}
                      className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
                    />
                  </td>
                  <td className='py-4 px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                    <input
                      type='text'
                      value={newSurat.pengirim}
                      onChange={e => handleAddInputChange(e, 'pengirim')}
                      className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
                    />
                  </td>
                  <td className='py-4 px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                    <input
                      type='text'
                      value={newSurat.perihal}
                      onChange={e => handleAddInputChange(e, 'perihal')}
                      className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
                    />
                  </td>
                  <td className='py-4 px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                    <input
                      type='text'
                      value={newSurat.tanggal_surat}
                      onChange={e => handleAddInputChange(e, 'tanggal_surat')}
                      className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
                    />
                  </td>
                  <td className='py-4 px-6 whitespace-nowrap text-sm font-medium'>
                    <div className='flex items-center space-x-2'>
                      <button
                        onClick={handleAdd}
                        className='text-green-500 hover:text-green-700'
                      >
                        Simpan
                      </button>
                      <button
                        onClick={e => {
                          e.preventDefault();
                          setIsAdding(false);
                        }}
                        className='text-gray-500 hover:text-gray-700'
                      >
                        Batal
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {arsipMasukData.map((surat, index) => (
                <tr
                  key={surat._id}
                  className={
                    index % 2 === 0
                      ? 'bg-gray-50 dark:bg-gray-700'
                      : 'bg-white dark:bg-gray-800'
                  }
                >
                  <td className='py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200'>
                    {surat.isEditing ? (
                      <input
                        type='number'
                        value={surat.no}
                        onChange={e => handleInputChange(e, surat._id, 'no')}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
                      />
                    ) : (
                      surat.no
                    )}
                  </td>
                  <td className='py-4 px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                    {surat.isEditing ? (
                      <input
                        type='text'
                        value={surat.nomor_surat}
                        onChange={e =>
                          handleInputChange(e, surat._id, 'nomor_surat')
                        }
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
                      />
                    ) : (
                      surat.nomor_surat
                    )}
                  </td>
                  <td className='py-4 px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                    {surat.isEditing ? (
                      <input
                        type='text'
                        value={surat.pengirim}
                        onChange={e =>
                          handleInputChange(e, surat._id, 'pengirim')
                        }
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
                      />
                    ) : (
                      surat.pengirim
                    )}
                  </td>
                  <td className='py-4 px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                    {surat.isEditing ? (
                      <input
                        type='text'
                        value={surat.perihal}
                        onChange={e =>
                          handleInputChange(e, surat._id, 'perihal')
                        }
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
                      />
                    ) : (
                      surat.perihal
                    )}
                  </td>
                  <td className='py-4 px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                    {surat.isEditing ? (
                      <input
                        type='text'
                        value={surat.tanggal_surat}
                        onChange={e =>
                          handleInputChange(e, surat._id, 'tanggal_surat')
                        }
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700'
                      />
                    ) : (
                      surat.tanggal_surat
                    )}
                  </td>
                  <td className='py-4 px-6 whitespace-nowrap text-sm font-medium'>
                    <div className='flex items-center space-x-2'>
                      {surat.isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(surat)}
                            className='text-green-500 hover:text-green-700'
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleCancelEdit(surat._id)}
                            className='text-gray-500 hover:text-gray-700'
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(surat._id)}
                            className='text-blue-500 hover:text-blue-700'
                          >
                            <PencilIcon className='h-5 w-5' />
                          </button>
                          <button
                            onClick={() => handleDelete(surat._id)}
                            className='text-red-500 hover:text-red-700'
                          >
                            <TrashIcon className='h-5 w-5' />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ArsipSuratMasukPage;
