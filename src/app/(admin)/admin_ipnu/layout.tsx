//layout admin
import { ReactNode } from 'react';
import { Providers } from '../../providers';
import SidebarIPNU from '../../components/admin/SidebarIPNU';
import '../../globals.css';
import Navbar from '@/app/components/admin/NavbarAdmin';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang='id' suppressHydrationWarning>
      <body className='dark:bg-gray-900'>
        <Providers>
          {/* Navbar fixed di atas */}
          <div className='fixed top-0 left-0 right-0 z-50'>
            <Navbar />
          </div>
          {/* Sidebar fixed di sisi kiri */}
          <div className='fixed top-16 left-0 h-[calc(100vh-4rem)] w-16 sm:w-64 z-40'>
            <SidebarIPNU />
          </div>
          {/* Konten utama dengan offset */}
          <main className='pt-16 sm:pl-64 h-screen bg-gray-50 dark:bg-gray-900 overflow-y-auto scrollbar-none px-4 sm:px-6'>
            {/* Perubahan: Menghapus 'max-w-5xl mx-auto' untuk memungkinkan lebar maksimal */}
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
