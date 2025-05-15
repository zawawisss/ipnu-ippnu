import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SuratTugas from '@/models/SuratTugas';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/nextauth';

export async function POST(request: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.json();
    const userId = session.user.id; // Assuming session.user.id contains the Admin ObjectId


    const newSuratTugas = new SuratTugas({
      ...formData,
      status: 'pending',
      createdBy: userId,
    });

    await newSuratTugas.save();

    return NextResponse.json({ message: 'Surat Tugas saved successfully', suratTugasId: newSuratTugas._id }, { status: 201 });
  } catch (error) {
    console.error('Error saving Surat Tugas:', error);
    return NextResponse.json({ message: 'Error saving Surat Tugas' }, { status: 500 });
  }
}
