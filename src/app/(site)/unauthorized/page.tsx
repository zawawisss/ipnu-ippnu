'use client';

import React from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <Card className='w-full max-w-md'>
        <CardBody className='text-center py-8'>
          <div className='flex justify-center mb-6'>
            <ExclamationTriangleIcon className='w-16 h-16 text-red-500' />
          </div>

          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Akses Ditolak
          </h1>

          <p className='text-gray-600 mb-6'>
            Anda tidak memiliki izin untuk mengakses halaman ini.
            {session?.user?.name && (
              <span className='block mt-2 text-sm'>
                Login sebagai: <strong>{session.user.name}</strong>
              </span>
            )}
          </p>

          <div className='space-y-3'>
            <Button
              color='primary'
              variant='solid'
              onPress={handleGoBack}
              startContent={<ArrowLeftIcon className='w-4 h-4' />}
              className='w-full'
            >
              Kembali
            </Button>

            <Button
              color='default'
              variant='bordered'
              onPress={handleGoHome}
              className='w-full'
            >
              Ke Halaman Utama
            </Button>

            <Button
              color='danger'
              variant='light'
              onPress={handleLogout}
              className='w-full'
            >
              Logout
            </Button>
          </div>

          <div className='mt-6 pt-4 border-t border-gray-200'>
            <p className='text-xs text-gray-500'>
              Jika Anda merasa ini adalah kesalahan, silakan hubungi
              administrator sistem.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
