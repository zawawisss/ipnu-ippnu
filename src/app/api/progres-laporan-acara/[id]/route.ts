import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProgresLaporanAcara from '@/models/ProgresLaporanAcara';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/nextauth';
import { isValidObjectId } from 'mongoose';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Mendapatkan progres laporan acara berdasarkan ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    await connectDB();

    const progresAcara = await ProgresLaporanAcara.findById(id).lean();

    if (!progresAcara) {
      return NextResponse.json(
        { error: 'Progres laporan acara tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: progresAcara,
    });
  } catch (error) {
    console.error('Error fetching progres laporan acara by ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update progres laporan acara berdasarkan ID
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    await connectDB();

    const body = await request.json();

    // Check if progres exists
    const existingProgres = await ProgresLaporanAcara.findById(id);
    if (!existingProgres) {
      return NextResponse.json(
        { error: 'Progres laporan acara tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update metadata
    body.lastModifiedBy = session.user?.name || session.user?.id || 'system';
    body.updatedAt = new Date();

    // Ensure sub-documents have required fields
    if (body.tugasPanitia) {
        body.tugasPanitia.forEach((panitia: any) => {
            if (panitia.daftarTugas) {
                panitia.daftarTugas.forEach((tugas: any) => {
                    if (!tugas.prioritas) {
                        tugas.prioritas = 'Sedang'; // Default value
                    }
                });
            }
        });
    }

    const updatedProgres = await ProgresLaporanAcara.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Progres laporan acara berhasil diperbarui',
      data: updatedProgres,
    });
  } catch (error) {
    console.error('Error updating progres laporan acara:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus progres laporan acara berdasarkan ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    await connectDB();

    const deletedProgres = await ProgresLaporanAcara.findByIdAndDelete(id);

    if (!deletedProgres) {
      return NextResponse.json(
        { error: 'Progres laporan acara tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Progres laporan acara berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting progres laporan acara:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
