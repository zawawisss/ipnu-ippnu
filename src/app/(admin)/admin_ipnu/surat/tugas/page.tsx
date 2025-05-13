// pages/index.js
import SuratTugasForm from '@/app/components/SuratTugasForm';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Generator Surat Tugas IPNU</title>
      </Head>
      <main className="min-h-screen bg-gray-100 p-6 dark:bg-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-center dark:text-gray-200">Generator Surat Tugas IPNU</h1>
        <SuratTugasForm />
      </main>
    </>
  );
}
