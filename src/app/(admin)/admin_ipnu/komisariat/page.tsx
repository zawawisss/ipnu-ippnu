//app/admin_ipnu/komisariat/page.tsx
'use client'; // Keep this directive as SekolahDataAdmin is a client component

import { Suspense } from 'react'; // Import Suspense
import SekolahDataAdmin from '@/app/components/admin/KomisariatAdmin';

export default function AdminKomisariatPage() {
  // Renamed from AdminDesaContent for clarity as it manages Komisariat
  return (
    <section className='p-6 sm:p-4 space-y-6'>
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100'>
            Kelola Komisariat
          </h1>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            Manajemen data komisariat/sekolah
          </p>
        </div>
      </div>

      {/* Content Card */}
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border-gray-700'>
        {/* Table Container */}
        <div className='rounded-lg overflow-hidden'>
          {/* Wrap the client component using useSearchParams with Suspense */}
          <Suspense fallback={<div>Loading Komisariat data...</div>}>
            <SekolahDataAdmin />{' '}
            {/* No need to pass searchParams directly here. SekolahDataAdmin will use useSearchParams internally. */}
          </Suspense>
        </div>
      </div>
    </section>
  );
}
