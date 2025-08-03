import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import ProgramKerja from '@/models/ProgramKerja';
import mongoose from 'mongoose';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();

  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid program ID' },
        { status: 400 }
      );
    }

    const programKerja = await ProgramKerja.findById(id)
      .populate('koordinator', 'nama_anggota jabatan kontak')
      .populate('supervisi.supervisor', 'nama_anggota jabatan kontak')
      .populate('anggota_tim', 'nama_anggota jabatan');

    if (!programKerja) {
      return NextResponse.json(
        { error: 'Program kerja not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: programKerja,
    });
  } catch (error) {
    console.error('Failed to fetch program kerja:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program kerja' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();

  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid program ID' },
        { status: 400 }
      );
    }

    const programKerja = await ProgramKerja.findByIdAndUpdate(
      id,
      {
        ...body,
        updated_at: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate('koordinator', 'nama_anggota jabatan kontak')
      .populate('supervisi.supervisor', 'nama_anggota jabatan kontak')
      .populate('anggota_tim', 'nama_anggota jabatan');

    if (!programKerja) {
      return NextResponse.json(
        { error: 'Program kerja not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Program kerja updated successfully',
      data: programKerja,
    });
  } catch (error) {
    console.error('Failed to update program kerja:', error);
    return NextResponse.json(
      { error: 'Failed to update program kerja' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();

  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid program ID' },
        { status: 400 }
      );
    }

    const programKerja = await ProgramKerja.findByIdAndDelete(id);

    if (!programKerja) {
      return NextResponse.json(
        { error: 'Program kerja not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Program kerja deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete program kerja:', error);
    return NextResponse.json(
      { error: 'Failed to delete program kerja' },
      { status: 500 }
    );
  }
}
