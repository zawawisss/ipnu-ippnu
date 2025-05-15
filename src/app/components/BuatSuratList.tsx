"use client";

import Link from "next/link";

interface BuatSuratListProps {
  org: "ipnu" | "ippnu";
}

export default function BuatSuratList({ org }: BuatSuratListProps) {
  const baseUrl = `/admin_${org}/surat/buat`;
  return (
    <div>
      <h1>Buat Surat</h1>
      <ul>
        <li>
          <Link href={`${baseUrl}/surat-tugas`}>Surat Tugas</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-rutin`}>Surat Rutin</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-pengantar`}>Surat Pengantar</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-keterangan`}>Surat Keterangan</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-keputusan`}>Surat Keputusan</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-pengesahan`}>Surat Pengesahan</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-rekomendasi-pengesahan`}>Surat Rekomendasi Pengesahan</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-rekomendasi`}>Surat Rekomendasi</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-mandat`}>Surat Mandat</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-pernyataan`}>Surat Pernyataan</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-instruksi`}>Surat Instruksi</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-peringatan`}>Surat Peringatan</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-edaran`}>Surat Edaran</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-kuasa`}>Surat Kuasa</Link>
        </li>
        <li>
          <Link href={`${baseUrl}/surat-keputusan-bersama`}>Surat Keputusan Bersama</Link>
        </li>
      </ul>
    </div>
  );
}
