import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Kaderisasi from '@/models/Kaderisasi';

// Handler for GET request (get all kaderisasi data with pagination and search)
export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const organization = searchParams.get('organization') || '';
    const jenjangKader = searchParams.get('jenjangKader') || '';
    const statusKader = searchParams.get('statusKader') || '';

    // Build query object
    const query: any = {};
    
    if (organization) {
      query.organization = organization;
    }
    
    if (jenjangKader) {
      query.jenjangKader = jenjangKader;
    }
    
    if (statusKader) {
      query.statusKader = statusKader;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { nama: { $regex: search, $options: 'i' } },
        { nim: { $regex: search, $options: 'i' } },
        { komisariat: { $regex: search, $options: 'i' } },
        { kecamatan: { $regex: search, $options: 'i' } },
        { desa: { $regex: search, $options: 'i' } },
        { mentor: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Kaderisasi.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get data with pagination
    const kaderisasiData = await Kaderisasi.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      data: kaderisasiData,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching kaderisasi data:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil data kaderisasi', error },
      { status: 500 }
    );
  }
}

// Handler for POST request (create new kaderisasi data)
export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    const body = await req.json();
    const {
      nama,
      nim,
      komisariat,
      kecamatan,
      desa,
      jenjangKader,
      statusKader,
      tanggalMulai,
      tanggalSelesai,
      mentor,
      materiSelesai,
      nilaiAkhir,
      sertifikat,
      catatan,
      organization
    } = body;

    // Basic validation
    if (!nama || !komisariat || !kecamatan || !desa || !jenjangKader || !tanggalMulai || !mentor || !organization) {
      return NextResponse.json(
        { message: 'Field yang wajib harus diisi: nama, komisariat, kecamatan, desa, jenjangKader, tanggalMulai, mentor, organization' },
        { status: 400 }
      );
    }

    // Validate organization
    if (!['IPNU', 'IPPNU'].includes(organization)) {
      return NextResponse.json(
        { message: 'Organization harus IPNU atau IPPNU' },
        { status: 400 }
      );
    }

    // Validate jenjangKader
    if (!['PKD', 'PKL', 'PKN'].includes(jenjangKader)) {
      return NextResponse.json(
        { message: 'Jenjang kader harus PKD, PKL, atau PKN' },
        { status: 400 }
      );
    }

    // Validate statusKader
    if (statusKader && !['Aktif', 'Tidak Aktif', 'Alumni'].includes(statusKader)) {
      return NextResponse.json(
        { message: 'Status kader harus Aktif, Tidak Aktif, atau Alumni' },
        { status: 400 }
      );
    }

    // Validate nilaiAkhir if provided
    if (nilaiAkhir !== undefined && (nilaiAkhir < 0 || nilaiAkhir > 100)) {
      return NextResponse.json(
        { message: 'Nilai akhir harus antara 0-100' },
        { status: 400 }
      );
    }

    // Create new kaderisasi data
    const newKaderisasi = new Kaderisasi({
      nama,
      nim,
      komisariat,
      kecamatan,
      desa,
      jenjangKader,
      statusKader: statusKader || 'Aktif',
      tanggalMulai: new Date(tanggalMulai),
      tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : undefined,
      mentor,
      materiSelesai: materiSelesai || [],
      nilaiAkhir,
      sertifikat: sertifikat || false,
      catatan,
      organization
    });

    await newKaderisasi.save();

    return NextResponse.json(newKaderisasi, { status: 201 });

  } catch (error: any) {
    console.error('Error creating kaderisasi data:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { message: 'Data tidak valid', errors: messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Gagal membuat data kaderisasi baru', error },
      { status: 500 }
    );
  }
}
