import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProgressUpdate from '@/models/ProgressUpdate';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/nextauth';
import { isValidObjectId } from 'mongoose';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Mendapatkan progress tracking berdasarkan ID
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

    const progressData = await ProgressUpdate.findById(id).lean();

    if (!progressData) {
      return NextResponse.json(
        { error: 'Progress tracking tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: progressData,
    });
  } catch (error) {
    console.error('Error fetching progress tracking by ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update progress tracking berdasarkan ID
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

    // Check if progress exists
    const existingProgress = await ProgressUpdate.findById(id);
    if (!existingProgress) {
      return NextResponse.json(
        { error: 'Progress tracking tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate progress percentage if provided
    if (body.progress_percentage !== undefined && 
        (body.progress_percentage < 0 || body.progress_percentage > 100)) {
      return NextResponse.json(
        { error: 'Progress percentage harus antara 0-100' },
        { status: 400 }
      );
    }

    // Update metadata
    body.updated_by = session.user?.name || session.user?.id || 'system';
    body.updated_at = new Date();

    const updatedProgress = await ProgressUpdate.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Progress tracking berhasil diperbarui',
      data: updatedProgress,
    });
  } catch (error) {
    console.error('Error updating progress tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus progress tracking berdasarkan ID
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

    const deletedProgress = await ProgressUpdate.findByIdAndDelete(id);

    if (!deletedProgress) {
      return NextResponse.json(
        { error: 'Progress tracking tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Progress tracking berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting progress tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
