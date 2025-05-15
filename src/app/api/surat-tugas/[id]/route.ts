import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import SuratTugas from '@/models/SuratTugas';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/nextauth';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
 const letterId = url.pathname.split('/').pop();

  if (!letterId) {
    return NextResponse.json({ message: 'Invalid letter ID' }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(letterId)) {
    return NextResponse.json({ message: 'Invalid letter ID' }, { status: 400 });
  }

  try {
    const suratTugas = await SuratTugas.findById(letterId);

    if (!suratTugas) {
      return NextResponse.json({ message: 'Surat Tugas not found' }, { status: 404 });
    }

    return NextResponse.json(suratTugas, { status: 200 });
  } catch (error) {
    console.error('Error fetching Surat Tugas by ID:', error);
    return NextResponse.json({ message: 'Error fetching Surat Tugas' }, { status: 500 });
  }
}
