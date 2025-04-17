import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import Kecamatan from '@/models/Kecamatan';

interface KecamatanData {
  kecamatan: string;
  tanggal_berakhir: string;
}

export async function GET(req: NextRequest) {
  try {
    await db();

    const kecamatanData: KecamatanData[] = await Kecamatan.find();
    console.log("Data dari database:", kecamatanData); // Tambahkan ini

    const today = new Date();
    const expired: string[] = [];
    const expiring: string[] = [];

    kecamatanData.forEach((kec) => {
      const endDate = new Date(kec.tanggal_berakhir);
      const diffInDays = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      if (diffInDays < 0) {
        expired.push(kec.kecamatan);
      } else if (diffInDays <= 14) {
        expiring.push(kec.kecamatan);
      }
    });

    const responseData = { expired, expiring };
    console.log("Response from /api/sp-status:", responseData); // Tambahkan ini
    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to fetch SP status:', error);
    return NextResponse.json({ error: 'Failed to fetch SP status' }, { status: 500 });
  }
}
