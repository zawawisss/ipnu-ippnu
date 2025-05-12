import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Desa from '@/models/Desa';

export async function GET() {
  await dbConnect();
  try {
    const desa = await Desa.find({});
    return NextResponse.json(desa);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch desa data' }, { status: 500 });
  }
}
