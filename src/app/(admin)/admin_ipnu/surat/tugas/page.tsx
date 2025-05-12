// pages/index.js
import SuratTugasForm from '@/app/components/SuratTugasForm';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Generator Surat Tugas IPNU</title>
      </Head>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Generator Surat Tugas IPNU</h1>
        <SuratTugasForm />
      </main>
    </>
  );
}
