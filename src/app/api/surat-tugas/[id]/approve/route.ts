import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import SuratTugas from '@/models/SuratTugas';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/nextauth';
import mongoose from 'mongoose';

interface Params {
  id: string;
}

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  await connectDB();

  const session = await getServerSession(authOptions);

  const { params } = context;

  if (!session || !session.user || !session.user.role || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const letterId = params.id;
  const userRole = session.user.role;
  const userId = new mongoose.Types.ObjectId(session.user.id);

  if (!mongoose.Types.ObjectId.isValid(letterId)) {
    return NextResponse.json({ message: 'Invalid letter ID' }, { status: 400 });
  }

  try {
    const suratTugas = await SuratTugas.findById(letterId);

    if (!suratTugas) {
      return NextResponse.json({ message: 'Surat Tugas not found' }, { status: 404 });
    }

    // Check if the user is authorized to approve based on their role and current status
    if (userRole === 'ketua' && suratTugas.status === 'pending') {
      suratTugas.status = 'approved_ketua';
      suratTugas.approvedByKetua = userId;
      suratTugas.approvalKetuaAt = new Date();
    } else if (userRole === 'sekretaris' && suratTugas.status === 'approved_ketua') {
      suratTugas.status = 'approved_all';
      suratTugas.approvedBySekretaris = userId;
      suratTugas.approvalSekretarisAt = new Date();
    } else {
      return NextResponse.json({ message: 'Not authorized to approve this letter at this stage' }, { status: 403 });
    }

    suratTugas.updatedAt = new Date();
    await suratTugas.save();

    return NextResponse.json({ message: 'Surat Tugas approved successfully', status: suratTugas.status }, { status: 200 });
  } catch (error) {
    console.error('Error approving Surat Tugas:', error);
    return NextResponse.json({ message: 'Error approving Surat Tugas' }, { status: 500 });
  }
}
