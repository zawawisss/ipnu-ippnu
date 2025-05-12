import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sekolah from '@/models/Sekolah';

export async function GET() {
  await dbConnect();
  try {
    const sekolah = await Sekolah.find({});
    return NextResponse.json(sekolah);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sekolah data' }, { status: 500 });
  }
}
