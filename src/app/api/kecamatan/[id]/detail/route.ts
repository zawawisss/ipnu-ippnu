import db from '@/lib/db';
import Anggota from '@/models/Anggota';
import Desa from '@/models/Desa';
import Sekolah from '@/models/Sekolah';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // params adalah Promise
) {
  const { id } = await context.params; // await params

  await db();

  // Validasi ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json('ID tidak valid', { status: 400 });
  }

  try {
    const [desa, totalDesa, sekolah, totalSekolah, anggota, totalAnggota] =
      await Promise.all([
        Desa.find({ kecamatan_id: id }),
        Desa.countDocuments({ kecamatan_id: id }),
        Sekolah.find({ kecamatan_id: id }),
        Sekolah.countDocuments({ kecamatan_id: id }),
        Anggota.find({ kecamatan_id: id }),
        Anggota.countDocuments({ kecamatan_id: id }),
      ]);

    return NextResponse.json({
      desa,
      sekolah,
      anggota,
      totalDesa,
      totalSekolah,
      totalAnggota,
    });
  } catch (error) {
    console.error('Error fetching kecamatan detail:', error);
    return NextResponse.json('Terjadi kesalahan server', { status: 500 });
  }
}
