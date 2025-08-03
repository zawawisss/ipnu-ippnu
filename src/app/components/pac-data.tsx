'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Chip,
  Divider,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import StatisticsCard from './statistik';
import dayjs from 'dayjs'; // Import dayjs

interface Database {
  _id: string;
  kecamatan: string;
  status_sp: string;
  tanggal_sp: string; // Changed from tanggal_berakhir to tanggal_sp
}

// Tambahkan fungsi utilitas untuk status SP
function getStatusSP(tanggal_sp: string | undefined) {
  // Changed parameter name
  if (!tanggal_sp) return '-';
  const endDate = dayjs(tanggal_sp); // Use dayjs for parsing
  const twoWeeksBefore = endDate.subtract(14, 'day'); // Use dayjs for date manipulation
  const now = dayjs(); // Use dayjs for current date
  if (now.isBefore(twoWeeksBefore)) {
    return (
      <Chip color='success' variant='dot' size='sm'>
        Aktif
      </Chip>
    );
  } else if (now.isBefore(endDate)) {
    return (
      <Chip color='warning' variant='dot' size='sm'>
        Hampir Berakhir
      </Chip>
    );
  } else {
    return (
      <Chip color='danger' variant='dot' size='sm'>
        Tidak Aktif
      </Chip>
    );
  }
}

function KecamatanDetail({ id }: { id: string }) {
  const [data, setData] = useState<Database | null>(null);
  const [total, setTotal] = useState<{
    totalDesa: number;
    totalSekolah: number;
    totalAnggota: number;
  }>({ totalDesa: 0, totalSekolah: 0, totalAnggota: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [desaList, setDesaList] = useState<any[]>([]);
  const [sekolahList, setSekolahList] = useState<any[]>([]);
  const [anggotaList, setAnggotaList] = useState<any[]>([]);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const filteredDesa = useMemo(() => {
    return desaList.filter(desa =>
      desa.nama_desa?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, desaList]);

  const filteredSekolah = useMemo(() => {
    return sekolahList.filter(sekolah =>
      sekolah.sekolah_maarif?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, sekolahList]);

  const filteredAnggota = useMemo(() => {
    return anggotaList.filter(anggota =>
      anggota.nama_anggota?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, anggotaList]);
  useEffect(() => {
    async function fetchData() {
      fetch(`/api/kecamatan/${id}/detail`)
        .then(res => res.json())
        .then(total => setTotal(total));
      try {
        const response = await fetch(`/api/kecamatan/${id}`);
        const result = await response.json();
        setData(result);

        const detail = await fetch(`/api/kecamatan/${id}/detail`);
        const { desa, sekolah, anggota } = await detail.json();

        setDesaList(Array.isArray(desa) ? desa : []);
        setSekolahList(Array.isArray(sekolah) ? sekolah : []);
        setAnggotaList(Array.isArray(anggota) ? anggota : []);
      } catch (error) {
        console.error('Gagal fetch detail kecamatan:', error);
      }
    }

    fetchData();
  }, [id]);

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <main className='container mx-auto px-4 py-8 flex-grow'>
        <div className='text-center mb-8 sm:mb-12'>
          <h2 className='text-4xl font-bold text-center mb-4'>
            STATISTIK KECAMATAN {data?.kecamatan || 'Memuat...'}
          </h2>
          <div className='flex justify-center gap-4 mb-6'>
            <div>
              <p className='text-sm font-semibold mb-1'>Status SP</p>
              {getStatusSP(data?.tanggal_sp)} {/* Changed to tanggal_sp */}
            </div>
            <div>
              <p className='text-sm font-semibold mb-1'>Tanggal SP</p>
              <p className='font-medium'>
                {data?.tanggal_sp // Changed to tanggal_sp
                  ? dayjs(data.tanggal_sp).format('DD MMMM YYYY') // Use dayjs for formatting
                  : '-'}
              </p>
            </div>
          </div>
          <div className='grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4'>
            <StatisticsCard
              title={'Ranting'}
              value={total.totalDesa}
              icon={'lucide:building'}
              color={'primary'}
            />
            <StatisticsCard
              title={'Komisariat'}
              value={total.totalSekolah}
              icon={'lucide:school'}
              color={'success'}
            />
            <StatisticsCard
              title={'Anggota'}
              value={total.totalAnggota}
              icon={'lucide:git-branch'}
              color={'warning'}
            />
          </div>
        </div>
        <Divider className='my-6 sm:my-8' />
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'>
          <div>
            <Input
              type='text'
              placeholder='Cari desa, sekolah, atau anggota...'
              value={searchTerm}
              onChange={handleSearchChange}
              className='mb-4'
            />
          </div>
          <div className='lg:col-span-full overflow-y-auto'>
            <h3 className='text-lg sm:text-xl font-bold mb-4'>
              DAFTAR RANTING
            </h3>
            {desaList.length === 0 ? (
              <p>Belum Ada Desa yang Terdaftar</p>
            ) : (
              <Table
                aria-label='Data Ranting'
                className='lg:col-span-full overflow-y-auto max-h-[200px] scrollbar-none scroll-smooth'
              >
                <TableHeader className='overflow-scroll'>
                  <TableColumn className='text-center overflow-scroll'>
                    #
                  </TableColumn>
                  <TableColumn className='text-center overflow-scroll'>
                    Nama Desa
                  </TableColumn>
                  <TableColumn className='text-center overflow-scroll'>
                    Status SP
                  </TableColumn>
                  <TableColumn className='text-center overflow-scroll'>
                    Tanggal SP
                  </TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredDesa.map((desa, index) => (
                    <TableRow key={desa._id}>
                      <TableCell className='text-center'>{index + 1}</TableCell>
                      <TableCell className='text-center'>
                        {desa.nama_desa}
                      </TableCell>
                      <TableCell className='text-center'>
                        {getStatusSP(desa.tanggal_sp)}
                      </TableCell>
                      <TableCell className='text-center'>
                        {desa.tanggal_sp
                          ? dayjs(desa.tanggal_sp).format('DD MMMM YYYY') // Use dayjs for formatting
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* TABEL SEKOLAH */}
          <div className='lg:col-span-full overflow-y-auto'>
            <h3 className='text-lg sm:text-xl font-bold mb-4'>
              DAFTAR SEKOLAH
            </h3>
            {sekolahList.length === 0 ? (
              <p>Belum Ada Sekolah yang Terdaftar</p>
            ) : (
              <Table
                aria-label='Data PAC'
                className='lg:col-span-full overflow-y-auto max-h-[200px] scrollbar-none scroll-smooth'
              >
                <TableHeader className='overflow-scroll'>
                  <TableColumn className='text-center overflow-scroll'>
                    #
                  </TableColumn>
                  <TableColumn className='text-center overflow-scroll'>
                    Nama Sekolah
                  </TableColumn>
                  <TableColumn className='text-center overflow-scroll'>
                    Status SP
                  </TableColumn>
                  <TableColumn className='text-center overflow-scroll'>
                    Tanggal SP
                  </TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredSekolah.map((sekolah, index) => (
                    <TableRow key={sekolah._id}>
                      <TableCell className='text-center'>{index + 1}</TableCell>
                      <TableCell className='text-center'>
                        {sekolah.sekolah_maarif}
                      </TableCell>
                      <TableCell className='text-center'>
                        {getStatusSP(sekolah.tanggal_sp)}
                      </TableCell>
                      <TableCell className='text-center'>
                        {sekolah.tanggal_sp
                          ? dayjs(sekolah.tanggal_sp).format('DD MMMM YYYY') // Use dayjs for formatting
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* TABEL ANGGOTA */}
          <div className='lg:col-span-full overflow-y-auto'>
            <h3 className='text-lg sm:text-xl font-bold mb-4'>
              DAFTAR ANGGOTA
            </h3>
            {anggotaList.length === 0 ? (
              <p>Belum Ada Anggota yang Terdaftar</p>
            ) : (
              <Table
                aria-label='Data PAC'
                className='lg:col-span-full overflow-y-auto max-h-[200px] scrollbar-none scroll-smooth'
              >
                <TableHeader className='overflow-scroll'>
                  <TableColumn className='text-center overflow-scroll'>
                    #
                  </TableColumn>
                  <TableColumn className='text-center overflow-scroll'>
                    Nama Anggota
                  </TableColumn>
                  <TableColumn className='text-center overflow-scroll'>
                    Jabatan
                  </TableColumn>
                  <TableColumn className='text-center overflow-scroll'>
                    Pengkaderan
                  </TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredAnggota.map((anggota, index) => (
                    <TableRow key={anggota._id}>
                      <TableCell className='text-center'>{index + 1}</TableCell>
                      <TableCell className='text-center'>
                        {anggota.nama_anggota}
                      </TableCell>
                      <TableCell className='text-center'>
                        {anggota.jabatan}
                      </TableCell>
                      <TableCell className='text-center'>
                        {anggota.pengkaderan}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default KecamatanDetail;
