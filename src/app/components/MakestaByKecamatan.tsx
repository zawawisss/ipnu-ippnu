'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Divider,
  Accordion,
  AccordionItem,
  Input,
  Spinner,
} from '@heroui/react';
import {
  EyeIcon,
  UsersIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import StatisticsCard from './statistik';

interface KaderisasiData {
  kecamatan: string;
  totalPeserta: number;
  ipnuCount: number;
  ippnuCount: number;
  aktifCount: number;
  alumniCount: number;
  tidakAktifCount: number;
  komisariat: Array<{
    name: string;
    totalPeserta: number;
    ipnuCount: number;
    ippnuCount: number;
    ranting: Array<{
      name: string;
      totalPeserta: number;
      ipnuCount: number;
      ippnuCount: number;
      peserta: Array<{
        _id: string;
        nama: string;
        nim?: string;
        organization: 'IPNU' | 'IPPNU';
        statusKader: 'Aktif' | 'Tidak Aktif' | 'Alumni';
        tanggalMulai: string;
        tanggalSelesai?: string;
        mentor: string;
        nilaiAkhir?: number;
        sertifikat: boolean;
      }>;
    }>;
  }>;
}

interface OverallStats {
  totalKecamatan: number;
  totalPeserta: number;
  totalIPNU: number;
  totalIPPNU: number;
  totalAktif: number;
  totalAlumni: number;
  totalTidakAktif: number;
}

const MakestaByKecamatan: React.FC = () => {
  const [data, setData] = useState<KaderisasiData[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalKecamatan: 0,
    totalPeserta: 0,
    totalIPNU: 0,
    totalIPPNU: 0,
    totalAktif: 0,
    totalAlumni: 0,
    totalTidakAktif: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedKecamatan, setSelectedKecamatan] =
    useState<KaderisasiData | null>(null);
  const [organizationFilter, setOrganizationFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        organizationFilter === 'ALL'
          ? '/api/kaderisasi-by-kecamatan?jenjangKader=MAKESTA'
          : `/api/kaderisasi-by-kecamatan?jenjangKader=MAKESTA&organization=${organizationFilter}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setOverallStats(result.overallStats);
      }
    } catch (error) {
      console.error('Error fetching MAKESTA data by kecamatan:', error);
    } finally {
      setLoading(false);
    }
  }, [organizationFilter]);

  useEffect(() => {
    fetchData();
  }, [organizationFilter, fetchData]);

  const handleDetailClick = (kecamatanData: KaderisasiData) => {
    setSelectedKecamatan(kecamatanData);
    onOpen();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'primary';
      case 'Alumni':
        return 'success';
      case 'Tidak Aktif':
        return 'danger';
      default:
        return 'default';
    }
  };

  const filteredData = data.filter(item =>
    item.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <Spinner size='lg' />
      </div>
    );
  }

  return (
    <div className='w-full space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <h2 className='text-2xl font-bold'>Data MAKESTA per Kecamatan</h2>
        <div className='flex gap-2'>
          <Input
            placeholder='Cari kecamatan...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-64'
            size='sm'
          />
          <Select
            placeholder='Filter Organisasi'
            selectedKeys={[organizationFilter]}
            onSelectionChange={keys => {
              const selectedOrg = Array.from(keys)[0] as string;
              setOrganizationFilter(selectedOrg);
            }}
            className='w-48'
            size='sm'
          >
            <SelectItem key='ALL'>Semua Organisasi</SelectItem>
            <SelectItem key='IPNU'>IPNU</SelectItem>
            <SelectItem key='IPPNU'>IPPNU</SelectItem>
          </Select>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
        <StatisticsCard
          title='Total Kecamatan'
          value={overallStats.totalKecamatan}
          icon='lucide:map-pin'
          color='primary'
        />
        <StatisticsCard
          title='Total Peserta'
          value={overallStats.totalPeserta}
          icon='lucide:users'
          color='success'
        />
        <StatisticsCard
          title='IPNU'
          value={overallStats.totalIPNU}
          icon='lucide:user-check'
          color='warning'
        />
        <StatisticsCard
          title='IPPNU'
          value={overallStats.totalIPPNU}
          icon='lucide:user-check'
          color='danger'
        />
      </div>

      <Divider />

      {/* Data per Kecamatan */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredData.map((kecamatanData, index) => (
          <Card key={index} className='hover:shadow-lg transition-shadow'>
            <CardHeader className='pb-2'>
              <div className='flex justify-between items-center w-full'>
                <h3 className='text-lg font-semibold'>
                  {kecamatanData.kecamatan}
                </h3>
                <Button
                  isIconOnly
                  size='sm'
                  variant='light'
                  onPress={() => handleDetailClick(kecamatanData)}
                >
                  <EyeIcon className='w-4 h-4' />
                </Button>
              </div>
            </CardHeader>
            <CardBody className='pt-0'>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Total Peserta:</span>
                  <span className='font-semibold'>
                    {kecamatanData.totalPeserta}
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-blue-600'>IPNU:</span>
                    <span className='font-medium'>
                      {kecamatanData.ipnuCount}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-pink-600'>IPPNU:</span>
                    <span className='font-medium'>
                      {kecamatanData.ippnuCount}
                    </span>
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-1 text-xs'>
                  <div className='text-center'>
                    <div className='text-green-600 font-medium'>
                      {kecamatanData.aktifCount}
                    </div>
                    <div className='text-gray-500'>Aktif</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-blue-600 font-medium'>
                      {kecamatanData.alumniCount}
                    </div>
                    <div className='text-gray-500'>Alumni</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-red-600 font-medium'>
                      {kecamatanData.tidakAktifCount}
                    </div>
                    <div className='text-gray-500'>T. Aktif</div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className='text-center py-8 text-gray-500'>
          Tidak ada data kecamatan yang ditemukan
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size='5xl'
        scrollBehavior='inside'
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <h3>Detail MAKESTA - {selectedKecamatan?.kecamatan}</h3>
                <p className='text-sm text-gray-500'>
                  Total {selectedKecamatan?.totalPeserta} peserta
                </p>
              </ModalHeader>
              <ModalBody>
                {selectedKecamatan && (
                  <div className='space-y-4'>
                    {/* Quick Stats */}
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                      <div className='bg-blue-50 p-3 rounded-lg text-center'>
                        <div className='text-lg font-bold text-blue-600'>
                          {selectedKecamatan.ipnuCount}
                        </div>
                        <div className='text-sm text-blue-600'>IPNU</div>
                      </div>
                      <div className='bg-pink-50 p-3 rounded-lg text-center'>
                        <div className='text-lg font-bold text-pink-600'>
                          {selectedKecamatan.ippnuCount}
                        </div>
                        <div className='text-sm text-pink-600'>IPPNU</div>
                      </div>
                      <div className='bg-green-50 p-3 rounded-lg text-center'>
                        <div className='text-lg font-bold text-green-600'>
                          {selectedKecamatan.alumniCount}
                        </div>
                        <div className='text-sm text-green-600'>Alumni</div>
                      </div>
                      <div className='bg-orange-50 p-3 rounded-lg text-center'>
                        <div className='text-lg font-bold text-orange-600'>
                          {selectedKecamatan.aktifCount}
                        </div>
                        <div className='text-sm text-orange-600'>Aktif</div>
                      </div>
                    </div>

                    {/* Hierarchical Structure: Kecamatan > Komisariat > Ranting */}
                    <Accordion variant='splitted'>
                      {selectedKecamatan.komisariat.map(
                        (komisariatData, komisariatIndex) => (
                          <AccordionItem
                            key={komisariatIndex}
                            aria-label={komisariatData.name}
                            title={
                              <div className='flex justify-between items-center w-full'>
                                <div className='flex items-center gap-2'>
                                  <AcademicCapIcon className='w-5 h-5 text-blue-600' />
                                  <span className='font-semibold'>
                                    {komisariatData.name}
                                  </span>
                                </div>
                                <div className='flex gap-2 text-sm'>
                                  <Chip
                                    size='sm'
                                    color='primary'
                                    variant='flat'
                                  >
                                    IPNU: {komisariatData.ipnuCount}
                                  </Chip>
                                  <Chip
                                    size='sm'
                                    color='secondary'
                                    variant='flat'
                                  >
                                    IPPNU: {komisariatData.ippnuCount}
                                  </Chip>
                                  <Chip
                                    size='sm'
                                    color='default'
                                    variant='flat'
                                  >
                                    Total: {komisariatData.totalPeserta}
                                  </Chip>
                                </div>
                              </div>
                            }
                          >
                            <div className='pl-4'>
                              <Accordion variant='light'>
                                {komisariatData.ranting.map(
                                  (rantingData, rantingIndex) => (
                                    <AccordionItem
                                      key={rantingIndex}
                                      aria-label={rantingData.name}
                                      title={
                                        <div className='flex justify-between items-center w-full'>
                                          <div className='flex items-center gap-2'>
                                            <UsersIcon className='w-4 h-4 text-green-600' />
                                            <span className='font-medium'>
                                              Ranting {rantingData.name}
                                            </span>
                                          </div>
                                          <div className='flex gap-2 text-xs'>
                                            <Chip
                                              size='sm'
                                              color='primary'
                                              variant='flat'
                                            >
                                              IPNU: {rantingData.ipnuCount}
                                            </Chip>
                                            <Chip
                                              size='sm'
                                              color='secondary'
                                              variant='flat'
                                            >
                                              IPPNU: {rantingData.ippnuCount}
                                            </Chip>
                                          </div>
                                        </div>
                                      }
                                    >
                                      <div className='pl-4'>
                                        <Table
                                          aria-label={`Peserta Ranting ${rantingData.name}`}
                                          removeWrapper
                                        >
                                          <TableHeader>
                                            <TableColumn>NAMA</TableColumn>
                                            <TableColumn>ORG</TableColumn>
                                            <TableColumn>STATUS</TableColumn>
                                            <TableColumn>MENTOR</TableColumn>
                                            <TableColumn>
                                              SERTIFIKAT
                                            </TableColumn>
                                          </TableHeader>
                                          <TableBody>
                                            {rantingData.peserta.map(
                                              peserta => (
                                                <TableRow key={peserta._id}>
                                                  <TableCell>
                                                    <div>
                                                      <div className='font-medium text-sm'>
                                                        {peserta.nama}
                                                      </div>
                                                      {peserta.nim && (
                                                        <div className='text-xs text-gray-500'>
                                                          {peserta.nim}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </TableCell>
                                                  <TableCell>
                                                    <Chip
                                                      size='sm'
                                                      color={
                                                        peserta.organization ===
                                                        'IPNU'
                                                          ? 'primary'
                                                          : 'secondary'
                                                      }
                                                      variant='flat'
                                                    >
                                                      {peserta.organization}
                                                    </Chip>
                                                  </TableCell>
                                                  <TableCell>
                                                    <Chip
                                                      size='sm'
                                                      color={getStatusColor(
                                                        peserta.statusKader
                                                      )}
                                                      variant='flat'
                                                    >
                                                      {peserta.statusKader}
                                                    </Chip>
                                                  </TableCell>
                                                  <TableCell className='text-sm'>
                                                    {peserta.mentor}
                                                  </TableCell>
                                                  <TableCell>
                                                    <Chip
                                                      size='sm'
                                                      color={
                                                        peserta.sertifikat
                                                          ? 'success'
                                                          : 'default'
                                                      }
                                                      variant={
                                                        peserta.sertifikat
                                                          ? 'solid'
                                                          : 'bordered'
                                                      }
                                                    >
                                                      {peserta.sertifikat
                                                        ? 'Ya'
                                                        : 'Belum'}
                                                    </Chip>
                                                  </TableCell>
                                                </TableRow>
                                              )
                                            )}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </AccordionItem>
                                  )
                                )}
                              </Accordion>
                            </div>
                          </AccordionItem>
                        )
                      )}
                    </Accordion>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default MakestaByKecamatan;
