import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import Kecamatan from '@/models/Kecamatan';
import Desa from '@/models/Desa';
import Sekolah from '@/models/Sekolah';

export async function GET(req: NextRequest) {
  try {
    await db();

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for accurate comparison

    const activeKecamatanCount = await Kecamatan.countDocuments({
      tanggal_sp: { $gte: today },
    });

    const activeDesaCount = await Desa.countDocuments({
      tanggal_sp: { $gte: today },
    });

    const activeSekolahCount = await Sekolah.countDocuments({
      tanggal_sp: { $gte: today },
    });

    const responseData = {
      activeKecamatan: activeKecamatanCount,
      activeDesa: activeDesaCount,
      activeSekolah: activeSekolahCount,
    };

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to fetch active SP counts:', error);
    return NextResponse.json({ error: 'Failed to fetch active SP counts' }, { status: 500 });
  }
}
