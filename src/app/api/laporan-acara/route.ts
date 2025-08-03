import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import LaporanAcara from '@/models/LaporanAcara';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Mendapatkan semua laporan acara
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const tingkat = searchParams.get('tingkat') || '';
    const departemen = searchParams.get('departemen') || '';
    const status = searchParams.get('status') || '';

    // Build filter query
    const filter: any = {};

    if (search) {
      filter.$or = [
        { 'acara.nama_acara': { $regex: search, $options: 'i' } },
        { 'organisasi.nama_unit': { $regex: search, $options: 'i' } },
        { 'pelapor.nama': { $regex: search, $options: 'i' } },
      ];
    }

    if (tingkat) filter['organisasi.tingkat'] = tingkat;
    if (departemen) filter['organisasi.departemen'] = departemen;
    if (status) filter['workflow.status'] = status;

    const skip = (page - 1) * limit;

    const [laporanAcara, total] = await Promise.all([
      LaporanAcara.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LaporanAcara.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: laporanAcara,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching laporan acara:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Membuat laporan acara baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Set metadata
    body.metadata = {
      dibuat_oleh: session.user?.email || '',
      dibuat_pada: new Date(),
      diperbarui_oleh: session.user?.email || '',
      diperbarui_pada: new Date(),
      versi: '1.0',
    };

    // Set workflow default status
    if (!body.workflow) {
      body.workflow = {
        status: 'draft',
        tahapan_approval: [],
        catatan_reviewer: [],
      };
    }

    const laporanAcara = new LaporanAcara(body);
    await laporanAcara.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Laporan acara berhasil dibuat',
        data: laporanAcara,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating laporan acara:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
