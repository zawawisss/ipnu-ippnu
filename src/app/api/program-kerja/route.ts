import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import ProgramKerja from '@/models/ProgramKerja';

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const searchQuery = searchParams.get('search') || '';
    const departemen = searchParams.get('departemen') || '';
    const status = searchParams.get('status') || '';
    const periode = searchParams.get('periode') || '';

    let query: any = {};

    // Filter berdasarkan departemen
    if (departemen) {
      query.departemen = departemen;
    }

    // Filter berdasarkan status
    if (status) {
      query.status = status;
    }

    // Filter berdasarkan periode
    if (periode) {
      query.periode = periode;
    }

    // Pencarian berdasarkan nama program atau deskripsi
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      query.$or = [
        { nama_program: { $regex: regex } },
        { deskripsi: { $regex: regex } },
        { penanggung_jawab: { $regex: regex } },
      ];
    }

    const programKerja = await ProgramKerja.find(query)
      .limit(limit)
      .skip(skip)
      .populate('koordinator', 'nama_anggota jabatan')
      .populate('supervisi.supervisor', 'nama_anggota jabatan')
      .sort({ created_at: -1 });

    const total = await ProgramKerja.countDocuments(query);

    return NextResponse.json({
      data: programKerja,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Failed to fetch program kerja data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program kerja data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();

    // Validasi input wajib
    const requiredFields = [
      'nama_program',
      'departemen',
      'penanggung_jawab',
      'tanggal_mulai',
      'tanggal_selesai',
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Build the new ProgramKerja document
    const newProgram = new ProgramKerja({
      nama_program: body.nama_program,
      deskripsi: body.deskripsi || '',
      jenis_program: body.jenis_program || 'insidental',
      prioritas: body.prioritas || 'rendah',
      status: body.status || 'perencanaan',
      tanggal_mulai: new Date(body.tanggal_mulai),
      tanggal_selesai: new Date(body.tanggal_selesai),
      departemen: body.departemen,
      tingkat_pelaksana: body.tingkat_pelaksana || 'PC',
      anggaran: {
        disetujui: body.anggaran_disetujui || 0,
        terpakai: body.anggaran_terpakai || 0,
      },
      target_peserta: body.target_peserta || 0,
      realisasi_peserta: body.realisasi_peserta || 0,
      koordinator: body.koordinator,
      supervisi: body.supervisi || [],
    });

    const programKerja = new ProgramKerja({
      ...body,
      status: body.status || 'perencanaan',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await programKerja.save();

    // Populate data untuk response
    await programKerja.populate('koordinator', 'nama_anggota jabatan');
    await programKerja.populate('supervisi.supervisor', 'nama_anggota jabatan');

    return NextResponse.json(
      {
        message: 'Program kerja created successfully',
        data: programKerja,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create program kerja:', error);
    return NextResponse.json(
      { error: 'Failed to create program kerja' },
      { status: 500 }
    );
  }
}
