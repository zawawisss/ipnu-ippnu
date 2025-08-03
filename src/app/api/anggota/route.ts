import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Anggota from '@/models/Anggota';

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const searchQuery = searchParams.get('search') || ''; // Mendapatkan parameter pencarian

    let query: any = {};
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i'); // Case-insensitive regex
      query = {
        $or: [
          { nama_anggota: { $regex: regex } },
          { alamat: { $regex: regex } },
          { pendidikan: { $regex: regex } },
          { jabatan: { $regex: regex } },
          { pengkaderan: { $regex: regex } },
        ],
      };
    }

    const anggota = await Anggota.find(query).limit(limit).skip(skip);
    const total = await Anggota.countDocuments(query); // Menerapkan filter pencarian juga pada total count

    return NextResponse.json({
      data: anggota,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Failed to fetch anggota data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anggota data' },
      { status: 500 }
    );
  }
}
