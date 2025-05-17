import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Sekolah from '@/models/Sekolah';

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const sekolah = await Sekolah.find({}).limit(limit).skip(skip);
    const total = await Sekolah.countDocuments({});

    return NextResponse.json({
      data: sekolah,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Failed to fetch sekolah data:', error);
    return NextResponse.json({ error: 'Failed to fetch sekolah data' }, { status: 500 });
  }
}
