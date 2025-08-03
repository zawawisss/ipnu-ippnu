import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProgressUpdate from '@/models/ProgressUpdate';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/nextauth';

// GET - Mendapatkan semua progress tracking
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unit = searchParams.get('unit') || '';
    const status = searchParams.get('status') || '';

    // Build filter query
    const filter: any = {};

    if (unit) filter.unit_name = { $regex: unit, $options: 'i' };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [progressData, total] = await Promise.all([
      ProgressUpdate.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProgressUpdate.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: progressData,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching progress tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Membuat progress tracking baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'unit_name',
      'program_no',
      'program_name',
      'progress_percentage'
    ];

    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          { error: `Field ${field} wajib diisi` },
          { status: 400 }
        );
      }
    }

    // Validate progress percentage
    if (body.progress_percentage < 0 || body.progress_percentage > 100) {
      return NextResponse.json(
        { error: 'Progress percentage harus antara 0-100' },
        { status: 400 }
      );
    }

    // Set metadata
    const progressData = {
      ...body,
      update_method: 'WEB',
      created_by: session.user?.name || session.user?.id || 'system',
      timestamp: new Date(),
    };

    const newProgress = new ProgressUpdate(progressData);
    await newProgress.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Progress tracking berhasil dibuat',
        data: newProgress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating progress tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
