/**
 * v0 by Vercel.
 * @see https://v0.dev/t/H9K3sBwKn
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Divider } from '@heroui/react';
import StatisticsCard from '../components/statistik';
import PACTable from '../components/pac-table';
import { Icon } from '@iconify/react';
import KaderisasiStats from '../components/KaderisasiStats';
import Link from 'next/link';

function Dashboard() {
  const [data, setData] = useState({
    totalKecamatan: 0,
    totalDesa: 0,
    totalSekolahMaarif: 0,
    totalAnggota: 0,
  });
  const [expiredSp, setExpiredSp] = useState<string[]>([]);
  const [expiringSp, setExpiringSp] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/total');
        if (!response.ok) {
          throw new Error(`Failed to fetch total data: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching total data:', error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/sp-status');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const spData = await response.json();

        if (typeof spData === 'object' && spData !== null) {
          setExpiredSp(spData.expired || []);
          setExpiringSp(spData.expiring || []);
        } else {
          console.error(
            'Unexpected data structure from /api/sp-status',
            spData
          );
          setExpiredSp([]);
          setExpiringSp([]);
        }
      } catch (error) {
        console.error('Error fetching SP status:', error);
        setExpiredSp([]);
        setExpiringSp([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const marqueeText = useMemo(() => {
    let text = '';
    if (loading) {
      return (
        <span className='inline-flex items-center rounded-md bg-gray-500 px-2.5 py-0.5 text-sm font-medium'>
          <Icon
            icon='svg-spinners:180-degree-spin'
            className='inline-block mr-1 h-4 w-4 animate-spin'
          />
          Loading...
        </span>
      );
    } else if (expiredSp.length > 0 || expiringSp.length > 0) {
      let expiredText =
        expiredSp.length > 0 ? (
          <span>
            <span className='inline-flex items-center rounded-md bg-red-500 px-2.5 py-0.5 text-sm font-medium text-white'>
              <Icon
                icon='ic:baseline-warning'
                className='inline-block mr-1 h-4 w-4'
              />
              Kecamatan Expired:
            </span>{' '}
            <span className='text-black dark:text-white'>
              {expiredSp.join(', ')}
            </span>
          </span>
        ) : null;
      let expiringText =
        expiringSp.length > 0 ? (
          <span>
            <span className='inline-flex items-center rounded-md bg-red-500 px-2.5 py-0.5 text-sm font-medium text-white'>
              <Icon
                icon='ic:baseline-warning'
                className='inline-block mr-1 h-4 w-4'
              />
              Kecamatan Expired:
            </span>{' '}
            <span className='text-black dark:text-white'>
              {expiringSp.join(', ')}
            </span>
          </span>
        ) : null;
      let separator = expiredText && expiringText ? ' | ' : '';
      return (
        <>
          {expiredText}
          {separator}
          {expiringText}
        </>
      );
    }
    return 'No SP data available.';
  }, [expiredSp, expiringSp, loading]);

  const classNames = (
    ...classes: (string | undefined | { [key: string]: boolean })[]
  ): string => {
    let result = '';
    classes.forEach(c => {
      if (c) {
        if (typeof c === 'string') {
          result += c + ' ';
        } else if (typeof c === 'object') {
          for (const key in c) {
            if (c[key]) {
              result += key + ' ';
            }
          }
        }
      }
    });
    return result.trim();
  };

  return (
    <div className='top-20 min-h-screen bg-background flex flex-col'>
      <main className='container mx-auto px-4 py-8 flex-grow'>
        {marqueeText && (
          <div className='w-full overflow-hidden mb-8 bg-primary-100 rounded-md'>
            <div className='animate-marquee whitespace-nowrap py-2  px-4 font-medium'>
              {marqueeText}

              {marqueeText}
            </div>
          </div>
        )}
        <div className='text-center mb-8 sm:mb-12'>
          <h2 className='text-xl sm:text-2xl font-bold mb-6 sm:mb-8'>
            Statistik PC IPNU-IPPNU Ponorogo
          </h2>
          <div
            className={classNames(
              'grid',
              'grid-cols-2',
              'sm:grid-cols-3',
              'lg:grid-cols-4',
              'gap-3',
              'sm:gap-4'
            )}
          >
            <StatisticsCard
              title={'Anak Cabang'}
              value={data.totalKecamatan}
              icon={'lucide:building'}
              color={'primary'}
              href='/kecamatan' // Link to kecamatan data
            />
            <StatisticsCard
              title={'Ranting'}
              value={data.totalDesa}
              icon={'lucide:git-branch'}
              color={'success'}
              href='/desa' // Link to desa data (needs to be created)
            />
            <StatisticsCard
              title={"Sekolah Ma'arif"}
              value={data.totalSekolahMaarif}
              icon={'lucide:school'}
              color={'warning'}
              href='/sekolah' // Link to sekolah data (needs to be created)
            />
            <StatisticsCard
              title={'Anggota'}
              value={data.totalAnggota}
              icon={'lucide:user-plus'}
              color={'primary'}
              href='/anggota' // Link to anggota data (needs to be created)
            />
          </div>
        </div>
        <Divider className='my-6 sm:my-8' />
        <KaderisasiStats />
        <div className='text-center mt-4'>
          <Link href='/kaderisasi-detail'>
            <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
              Lihat Detail Alumni MAKESTA
            </button>
          </Link>
        </div>
        <Divider className='my-6 sm:my-8' />
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'>
          <div className='lg:col-span-full'>
            <h3 className='text-lg sm:text-xl font-bold mb-4'>
              DAFTAR ANAK CABANG
            </h3>
            <PACTable />
          </div>
        </div>
      </main>
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
          display: inline-block;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
