import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProgresLaporanAcara from '@/models/ProgresLaporanAcara';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/nextauth';

// GET - Mendapatkan semua progres laporan acara
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
    const departemen = searchParams.get('departemen') || '';
    const status = searchParams.get('status') || '';

    // Build filter query
    const filter: any = {};

    if (search) {
      filter.$or = [
        { namaAcara: { $regex: search, $options: 'i' } },
        { departemen: { $regex: search, $options: 'i' } },
        { 'penanggungJawab.nama': { $regex: search, $options: 'i' } },
      ];
    }

    if (departemen) filter.departemen = departemen;
    if (status) filter.statusAcara = status;

    const skip = (page - 1) * limit;

    const [progresAcara, total] = await Promise.all([
      ProgresLaporanAcara.find(filter)
        .sort({ 'jadwalAcara.tanggalMulai': -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProgresLaporanAcara.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: progresAcara,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching progres laporan acara:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Membuat progres laporan acara baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Set metadata
    body.createdBy = session.user?.name || session.user?.id || 'system';
    body.lastModifiedBy = session.user?.name || session.user?.id || 'system';

    // Validate required fields
    const requiredFields = [
      'namaAcara',
      'departemen',
      'penanggungJawab',
      'jadwalAcara',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field ${field} wajib diisi` },
          { status: 400 }
        );
      }
    }

    // Initialize empty arrays if not provided and filter out incomplete items
    if (!body.daftarKebutuhan) {
      body.daftarKebutuhan = [];
    } else {
      // Filter out incomplete kebutuhan items
      body.daftarKebutuhan = body.daftarKebutuhan.filter((item: any) => 
        item.item && item.pic && item.kuantitas !== undefined && item.satuan
      );
    }
    
    if (!body.koordinasi) {
      body.koordinasi = [];
    } else {
      // Filter out incomplete koordinasi items
      body.koordinasi = body.koordinasi.filter((item: any) => 
        item.pihak && item.topik && item.kontakPerson && item.pic
      );
    }
    
    if (!body.tugasPanitia) {
      body.tugasPanitia = [];
    } else {
      // Filter out incomplete tugasPanitia items
      body.tugasPanitia = body.tugasPanitia.filter((panitia: any) => {
        if (!panitia.namaAnggota || !panitia.jabatan || !panitia.tugasUtama) {
          return false;
        }
        // Filter out incomplete tasks within each panitia
        if (panitia.daftarTugas) {
          panitia.daftarTugas = panitia.daftarTugas.filter((tugas: any) => 
            tugas.tugas && tugas.deadline
          );
        }
        return true;
      });
    }
    
    if (!body.timeline) body.timeline = [];
    if (!body.catatanProgres) body.catatanProgres = [];
    
    if (!body.anggaranProgres) {
      body.anggaranProgres = {
        totalAnggaranRencana: 0,
        totalRealisasi: 0,
        rincianBiaya: [],
      };
    } else {
      // Filter out incomplete budget items
      if (body.anggaranProgres.rincianBiaya) {
        body.anggaranProgres.rincianBiaya = body.anggaranProgres.rincianBiaya.filter((item: any) => 
          item.kategori && item.item && item.anggaranRencana !== undefined
        );
      }
    }

    const progresAcara = new ProgresLaporanAcara(body);
    await progresAcara.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Progres laporan acara berhasil dibuat',
        data: progresAcara,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating progres laporan acara:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
