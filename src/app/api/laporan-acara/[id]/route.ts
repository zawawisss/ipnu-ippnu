import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import LaporanAcara from '@/models/LaporanAcara';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/nextauth';
import { isValidObjectId } from 'mongoose';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Mendapatkan laporan acara berdasarkan ID
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

    const laporanAcara = await LaporanAcara.findById(id).lean();

    if (!laporanAcara) {
      return NextResponse.json(
        { error: 'Laporan acara tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: laporanAcara,
    });
  } catch (error) {
    console.error('Error fetching laporan acara by ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update laporan acara berdasarkan ID
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

    // Check if laporan exists
    const existingLaporan = await LaporanAcara.findById(id);
    if (!existingLaporan) {
      return NextResponse.json(
        { error: 'Laporan acara tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update metadata
    body.metadata = {
      ...existingLaporan.metadata,
      diperbarui_oleh: session.user?.email || '',
      diperbarui_pada: new Date(),
      versi: existingLaporan.metadata?.versi
        ? (parseFloat(existingLaporan.metadata.versi) + 0.1).toFixed(1)
        : '1.1',
    };

    const updatedLaporan = await LaporanAcara.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Laporan acara berhasil diperbarui',
      data: updatedLaporan,
    });
  } catch (error) {
    console.error('Error updating laporan acara:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus laporan acara berdasarkan ID
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

    const deletedLaporan = await LaporanAcara.findByIdAndDelete(id);

    if (!deletedLaporan) {
      return NextResponse.json(
        { error: 'Laporan acara tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Laporan acara berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting laporan acara:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
