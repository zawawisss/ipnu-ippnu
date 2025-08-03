import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Kecamatan from '@/models/Kecamatan';
import Desa from '@/models/Desa';
import Sekolah from '@/models/Sekolah';
import Anggota from '@/models/Anggota';

export async function GET() {
  await dbConnect();

  try {
    // Hitung total dan aktif berdasarkan SP
    const [
      totalKecamatan,
      totalDesa,
      desaAktif,
      totalKomisariat,
      komisariatAktif,
      totalAnggota,
    ] = await Promise.all([
      Kecamatan.countDocuments(),
      Desa.countDocuments(),
      Desa.countDocuments({
        nomor_sp: { $exists: true, $ne: null, $nin: ['', '-'] },
      }),
      Sekolah.countDocuments(),
      Sekolah.countDocuments({
        nomor_sp: { $exists: true, $ne: null, $nin: [''] },
      }),
      Anggota.countDocuments(),
    ]);

    // Data struktur organisasi
    const strukturStats = {
      total_pac: totalKecamatan, // PAC = Kecamatan
      pac_aktif: totalKecamatan, // Semua kecamatan dianggap aktif karena ada data
      total_pr: totalDesa, // PR = Desa/Ranting
      pr_aktif: desaAktif, // Desa yang memiliki SP
      total_pk: totalKomisariat, // PK = Komisariat/Sekolah
      pk_aktif: komisariatAktif, // Komisariat yang memiliki SP
      total_anggota: totalAnggota,
    };

    return NextResponse.json({
      success: true,
      data: strukturStats,
    });
  } catch (error) {
    console.error('Failed to fetch struktur stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch struktur statistics' },
      { status: 500 }
    );
  }
}
