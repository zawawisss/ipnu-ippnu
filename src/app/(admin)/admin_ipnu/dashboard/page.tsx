'use client';
import { useState, useEffect } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/nextauth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import PACTable from '@/app/components/pac-table';
import { Divider } from '@heroui/react';
import StatisticsCard from '@/app/components/statistik'; // Import StatisticsCard

function AdminIPNUPage() {
  const [stats, setStats] = useState({
    activeKecamatan: 0,
    activeDesa: 0,
    activeSekolah: 0,
    totalAnggota: 0, // Assuming you'll fetch this later
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const spCountsResponse = await fetch('/api/sp-status-counts');
        const spCountsData = await spCountsResponse.json();

        const anggotaResponse = await fetch('/api/anggota');
        const anggotaData = await anggotaResponse.json();

        setStats(prevStats => ({
          ...prevStats,
          activeKecamatan: spCountsData.activeKecamatan,
          activeDesa: spCountsData.activeDesa,
          activeSekolah: spCountsData.activeSekolah,
          totalAnggota: anggotaData.total,
        }));
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className='flex min-h-screen'>
      {/* Main Content */}
      <main className='flex-1 p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'>
        <h1 className='text-2xl font-bold mb-6'>Dashboard Admin</h1>

        {/* Statistik Cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          <StatisticsCard
            title='Total Kecamatan (SP Aktif)'
            value={stats.activeKecamatan}
            icon='mdi:city'
            color='primary'
            href='/admin_ipnu/kecamatan'
          />
          <StatisticsCard
            title='Total Desa (SP Aktif)'
            value={stats.activeDesa}
            icon='mdi:home-city'
            color='success'
            href='/admin_ipnu/desa'
          />
          <StatisticsCard
            title='Total Komisariat (SP Aktif)'
            value={stats.activeSekolah}
            icon='mdi:school'
            color='warning'
            href='/admin_ipnu/sekolah'
          />
          <StatisticsCard
            title='Total Anggota'
            value={stats.totalAnggota} // This still needs to be fetched
            icon='mdi:account-group'
            color='primary'
            href='/admin_ipnu/anggota'
          />
        </div>
        <Divider className='my-6 sm:my-8' />
      </main>
    </div>
  );
}
export default AdminIPNUPage;
