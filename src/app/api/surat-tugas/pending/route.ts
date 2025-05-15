import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SuratTugas from '@/models/SuratTugas';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/nextauth';

export async function GET(request: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.role) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all letters that are not yet fully approved
  const filter = { status: { $ne: 'approved_all' } };

  try {
    const pendingSuratTugas = await SuratTugas.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(pendingSuratTugas, { status: 200 });
  } catch (error) {
    console.error('Error fetching pending/partially approved Surat Tugas:', error);
    return NextResponse.json({ message: 'Error fetching pending/partially approved Surat Tugas' }, { status: 500 });
  }
}
