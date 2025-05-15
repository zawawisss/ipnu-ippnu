import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SuratTugas from '@/models/SuratTugas';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/nextauth';

export async function GET(request: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all fully approved letters
  const filter = { status: 'approved_all' };

  try {
    const approvedSuratTugas = await SuratTugas.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(approvedSuratTugas, { status: 200 });
  } catch (error) {
    console.error('Error fetching approved Surat Tugas:', error);
    return NextResponse.json({ message: 'Error fetching approved Surat Tugas' }, { status: 500 });
  }
}
