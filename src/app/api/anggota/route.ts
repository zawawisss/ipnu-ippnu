import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Anggota from '@/models/Anggota';

export async function GET() {
  await dbConnect();
  try {
    const anggota = await Anggota.find({});
    return NextResponse.json(anggota);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch anggota data' }, { status: 500 });
  }
}
