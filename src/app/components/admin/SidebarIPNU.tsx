// components/Sidebar.tsx
'use client';

import { useState } from 'react';
import { Button } from '@heroui/react'; // Hanya impor Button jika Navbar tidak dipakai lagi
import {
  ChartBarSquareIcon,
  MapPinIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArchiveBoxIcon,
  DocumentIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  PresentationChartLineIcon,
  CalendarIcon,
  CogIcon,
  ClipboardDocumentCheckIcon,
  ClipboardIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { BellIcon } from 'lucide-react';

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null
  );

  // Determine the display role
  const displayRole = session?.user?.role
    ? session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)
    : 'Guest';
  const displayOrg = session?.user?.name?.includes('ippnu') ? 'IPPNU' : 'IPNU';
  const displayUser = session?.user?.name
    ? `${displayOrg} ${displayRole}`
    : 'Loading...';

  const handleDropdownToggle = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Menu Organisasi & Wilayah
  const organisasiWilayahDropdown = {
    name: 'Organisasi & Wilayah',
    icon: BuildingOfficeIcon,
    children: [
      { name: 'Kecamatan', href: '/admin_ipnu/kecamatan', icon: MapPinIcon },
      { name: 'Desa', href: '/admin_ipnu/desa', icon: MapPinIcon },
      {
        name: 'Komisariat',
        href: '/admin_ipnu/komisariat',
        icon: AcademicCapIcon,
      },
      { name: 'Anggota', href: '/admin_ipnu/anggota', icon: UserGroupIcon },
    ],
  };

  // Menu Kaderisasi dengan submenu yang lebih terstruktur
  const kaderisasiDropdown = {
    name: 'Kaderisasi',
    icon: AcademicCapIcon,
    children: [
      {
        name: 'Dashboard Kaderisasi',
        href: '/admin_ipnu/kaderisasi',
        icon: ChartBarSquareIcon,
      },
      {
        name: 'MAKESTA',
        href: '/admin_ipnu/kaderisasi/makesta',
        icon: AcademicCapIcon,
      },
      {
        name: 'LAKMUD',
        href: '/admin_ipnu/kaderisasi/lakmud',
        icon: AcademicCapIcon,
      },
      {
        name: 'LAKUT',
        href: '/admin_ipnu/kaderisasi/lakut',
        icon: AcademicCapIcon,
      },
      {
        name: 'LATIN',
        href: '/admin_ipnu/kaderisasi/latin',
        icon: AcademicCapIcon,
      },
    ],
  };

  // Menu Manajemen Surat yang digabungkan
  const manajemenSuratDropdown = {
    name: 'Manajemen Surat',
    icon: DocumentIcon,
    children: [
      {
        name: 'Buat Surat',
        href: '/admin_ipnu/surat/tambah',
        icon: DocumentIcon,
      },
      {
        name: 'Persetujuan Surat',
        href: '/admin_ipnu/surat/persetujuan',
        icon: ClipboardDocumentCheckIcon,
      },
      {
        name: 'Arsip Surat Masuk',
        href: '/admin_ipnu/surat/arsip/masuk',
        icon: ArchiveBoxIcon,
      },
      {
        name: 'Arsip Surat Keluar',
        href: '/admin_ipnu/surat/arsip/keluar',
        icon: ArrowLeftOnRectangleIcon,
      },
    ],
  };

  // Menu Laporan Keuangan & Statistik
  const laporanKeuanganDropdown = {
    name: 'Laporan & Statistik',
    icon: PresentationChartLineIcon,
    children: [
      {
        name: 'Laporan Keuangan',
        href: '/admin_ipnu/laporan-keuangan',
        icon: BanknotesIcon,
      },
      {
        name: 'Statistik & Analytics',
        href: '/admin_ipnu/statistik',
        icon: ChartBarSquareIcon,
      },
    ],
  };

  // Menu Manajemen Event dengan submenu
  const manajemenEventDropdown = {
    name: 'Manajemen Event',
    icon: WrenchScrewdriverIcon,
    children: [
      {
        name: 'Dashboard Event',
        href: '/admin_ipnu/event',
        icon: ChartBarSquareIcon,
      },
      {
        name: 'Buat Event Baru',
        href: '/admin_ipnu/event/new',
        icon: CalendarIcon,
      },
    ],
  };

  // Menu Kalender (single item)
  const kalenderItem = {
    name: 'Kalender',
    href: '/admin_ipnu/kalender',
    icon: CalendarIcon,
  };

  const progressTrackingDropdown = {
    name: 'Progress Tracking',
    icon: ChartBarSquareIcon,
    children: [
      {
        name: 'Dashboard Progress',
        href: '/admin_ipnu/dashboard-progress',
        icon: ChartBarSquareIcon,
      },
      {
        name: 'Progress Overview',
        href: '/admin_ipnu/progress-overview',
        icon: PresentationChartLineIcon,
      },
      {
        name: 'Update Progress',
        href: '/admin_ipnu/update-progress',
        icon: ClipboardIcon,
      },
    ],
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin_ipnu/dashboard',
      icon: ChartBarSquareIcon,
    },
    organisasiWilayahDropdown,
    kaderisasiDropdown,
    manajemenSuratDropdown,
    manajemenEventDropdown,
    progressTrackingDropdown,
    laporanKeuanganDropdown,
    kalenderItem,
  ];

  return (
    <>
      {/* Sidebar desktop */}
      <aside className='hidden sm:flex sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 flex-col transition-width duration-300'>
        <div className='flex flex-col items-center py-6 border-b border-gray-200 dark:border-gray-700'>
          <Image
            src={displayOrg === 'IPPNU' ? '/ippnu.png' : '/ipnu.png'}
            alt={displayOrg}
            width={56}
            height={56}
            className='rounded-full mb-2 shadow-md'
          />
          <span className='text-base font-bold text-primary-600 dark:text-primary-400'>
            {session?.user?.name || 'User'}
          </span>
          <span className='text-xs text-gray-500 dark:text-gray-300'>
            {displayUser}
          </span>
        </div>
        <div className='flex-1 px-2 py-4 space-y-1'>
          {/* Menu navigasi */}
          {navItems.map(item => {
            if ('children' in item) {
              // Render parent item with children as a dropdown
              const isOpen = openDropdown === item.name;
              return (
                <div key={item.name}>
                  <button
                    type='button'
                    onClick={() => setOpenDropdown(isOpen ? null : item.name)}
                    className='flex items-center justify-between w-full gap-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  >
                    <div className='flex items-center gap-3'>
                      {item.icon && (
                        <item.icon className='w-6 h-6 flex-shrink-0' />
                      )}
                      <span className='text-sm font-medium'>{item.name}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUpIcon className='w-5 h-5' />
                    ) : (
                      <ChevronDownIcon className='w-5 h-5' />
                    )}
                  </button>
                  {isOpen && (
                    <div className='ml-4 space-y-1'>
                      {item.children.map((child: any) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className='flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
                        >
                          <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                            {child.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-gray-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon && (
                    <item.icon
                      className={`w-6 h-6 flex-shrink-0 ${
                        isActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                    />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      isActive
                        ? 'text-primary-700 dark:text-white'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            }
          })}
        </div>
        <div className='mt-auto py-3 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700'>
          &copy; {new Date().getFullYear()} IPNU/IPPNU Kab. Cirebon
        </div>
      </aside>
      {/* Bottom nav mobile */}
      <nav className='sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-14'>
        {navItems.map(item => {
          if ('children' in item) {
            const isOpen = openMobileDropdown === item.name;
            return (
              <div
                key={item.name}
                className='relative flex-1 flex flex-col items-center'
              >
                <button
                  type='button'
                  onClick={() =>
                    setOpenMobileDropdown(isOpen ? null : item.name)
                  }
                  className={`flex flex-col items-center justify-center w-full py-1 ${
                    isOpen
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-300'
                  }`}
                >
                  {item.icon && <item.icon className='w-6 h-6 mb-0.5' />}
                  <span className='text-xs leading-none'>{item.name}</span>
                  <ChevronUpIcon
                    className={`w-4 h-4 mx-auto mt-0.5 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className='absolute bottom-14 left-1/2 -translate-x-1/2 min-w-max bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50'>
                    {item.children.map((child: any) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        onClick={() => setOpenMobileDropdown(null)}
                      >
                        {child.icon && <child.icon className='w-5 h-5' />}
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          } else {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href!}
                className={`flex flex-col items-center justify-center flex-1 py-1 ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-300'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon && <item.icon className='w-6 h-6 mb-0.5' />}
                <span className='text-xs leading-none'>{item.name}</span>
              </Link>
            );
          }
        })}
      </nav>
    </>
  );
}
