'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Card,
  CardBody,
} from '@heroui/react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import MakestaForm from '@/app/components/admin/MakestaForm';

// Function to convert Excel serial date to JavaScript Date object
function excelSerialDateToJSDate(serial: number): Date {
  const daysSinceEpoch = serial - 25569; // Days since 1970-01-01
  const ms = daysSinceEpoch * 24 * 60 * 60 * 1000;
  return new Date(ms);
}

function MakestaAdminPage() {
  const [makestaData, setMakestaData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/makesta?organisasi=IPNU'); // Only fetch IPNU data
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMakestaData(data);
      setFilteredData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(makestaData);
    } else {
      const filtered = makestaData.filter((item: any) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.PIMPINAN?.toLowerCase().includes(searchLower) ||
          item.TEMPAT?.toLowerCase().includes(searchLower) ||
          item.PENGKADERAN?.toLowerCase().includes(searchLower) ||
          item.organisasi?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredData(filtered);
    }
  }, [searchTerm, makestaData]);

  const handleCreate = () => {
    setFormMode('create');
    setEditData(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setFormMode('edit');
    setEditData(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (item: any) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus data MAKESTA ini?\n\nPimpinan: ${item.PIMPINAN}\nTempat: ${item.TEMPAT}`
      )
    ) {
      try {
        const response = await fetch(
          `/api/makesta?id=${item._id}&organisasi=${item.organisasi}`,
          {
            method: 'DELETE',
          }
        );

        if (response.ok) {
          await fetchData(); // Refresh data
          alert('Data berhasil dihapus!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('Terjadi kesalahan saat menghapus data');
      }
    }
  };

  const handleFormSuccess = () => {
    fetchData(); // Refresh data after successful create/update
  };

  if (loading) return <div className='text-center py-8'>Loading data...</div>;
  if (error)
    return <div className='text-center py-8 text-red-500'>Error: {error}</div>;

  const columns = [
    { key: 'TANGGAL', label: 'Tanggal' },
    { key: 'PENGKADERAN', label: 'Pengkaderan' },
    { key: 'PIMPINAN', label: 'Pimpinan' },
    { key: 'TEMPAT', label: 'Tempat' },
    { key: 'JUMLAH', label: 'Jumlah Peserta' },
    { key: 'actions', label: 'Aksi' },
  ];

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex flex-col gap-4 mb-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold'>Kelola Data MAKESTA</h1>
          <Button
            color='primary'
            startContent={<PlusIcon className='w-4 h-4' />}
            onPress={handleCreate}
          >
            Tambah Data
          </Button>
        </div>

        <Card>
          <CardBody>
            <div className='flex gap-4 items-center'>
              <Input
                placeholder='Cari berdasarkan pimpinan, tempat, atau organisasi...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                startContent={
                  <MagnifyingGlassIcon className='w-4 h-4 text-gray-400' />
                }
                className='flex-1'
              />
              <div className='text-sm text-gray-500 whitespace-nowrap'>
                {filteredData.length} dari {makestaData.length} data
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className='overflow-x-auto'>
        <Table aria-label='Tabel Data MAKESTA' className='min-w-full'>
          <TableHeader columns={columns}>
            {column => (
              <TableColumn
                key={column.key}
                className={column.key === 'actions' ? 'text-center' : ''}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={filteredData} emptyContent='Tidak ada data'>
            {(item: any) => (
              <TableRow key={item._id}>
                {columnKey => {
                  if (columnKey === 'organisasi') {
                    return (
                      <TableCell>
                        <Chip
                          color={
                            item.organisasi === 'IPNU' ? 'primary' : 'success'
                          }
                          variant='flat'
                          size='sm'
                        >
                          {item.organisasi}
                        </Chip>
                      </TableCell>
                    );
                  } else if (
                    columnKey === 'TANGGAL' &&
                    typeof item.TANGGAL === 'number'
                  ) {
                    return (
                      <TableCell>
                        {format(
                          excelSerialDateToJSDate(item.TANGGAL),
                          'dd MMMM yyyy'
                        )}
                      </TableCell>
                    );
                  } else if (columnKey === 'actions') {
                    return (
                      <TableCell>
                        <div className='flex justify-center'>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size='sm' variant='light'>
                                <EllipsisVerticalIcon className='w-4 h-4' />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              <DropdownItem
                                key='edit'
                                startContent={
                                  <PencilIcon className='w-4 h-4' />
                                }
                                onPress={() => handleEdit(item)}
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                key='delete'
                                className='text-danger'
                                color='danger'
                                startContent={<TrashIcon className='w-4 h-4' />}
                                onPress={() => handleDelete(item)}
                              >
                                Hapus
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell>
                      {item[columnKey as keyof typeof item] || '-'}
                    </TableCell>
                  );
                }}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MakestaForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editData={editData}
        mode={formMode}
      />
    </div>
  );
}

export default MakestaAdminPage;
