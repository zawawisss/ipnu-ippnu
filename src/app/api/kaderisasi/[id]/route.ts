import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Kaderisasi from '@/models/Kaderisasi';
import mongoose from 'mongoose';

// Handler for GET request (get single kaderisasi data by ID)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Connect to database
    await dbConnect();
    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'ID tidak valid' },
        { status: 400 }
      );
    }

    const kaderisasi = await Kaderisasi.findById(id);

    if (!kaderisasi) {
      return NextResponse.json(
        { message: 'Data kaderisasi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(kaderisasi, { status: 200 });

  } catch (error) {
    console.error('Error fetching kaderisasi data:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil data kaderisasi', error },
      { status: 500 }
    );
  }
}

// Handler for PUT request (update kaderisasi data)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Connect to database
    await dbConnect();
    const { id } = params;
    const body = await req.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'ID tidak valid' },
        { status: 400 }
      );
    }

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

    // Prepare update data
    const updateData = {
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
    };

    const updatedKaderisasi = await Kaderisasi.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedKaderisasi) {
      return NextResponse.json(
        { message: 'Data kaderisasi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedKaderisasi, { status: 200 });

  } catch (error) {
    console.error('Error updating kaderisasi data:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { message: 'Data tidak valid', errors: messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Gagal memperbarui data kaderisasi', error },
      { status: 500 }
    );
  }
}

// Handler for DELETE request (delete kaderisasi data)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Connect to database
    await dbConnect();
    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'ID tidak valid' },
        { status: 400 }
      );
    }

    const deletedKaderisasi = await Kaderisasi.findByIdAndDelete(id);

    if (!deletedKaderisasi) {
      return NextResponse.json(
        { message: 'Data kaderisasi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Data kaderisasi berhasil dihapus', data: deletedKaderisasi },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting kaderisasi data:', error);
    return NextResponse.json(
      { message: 'Gagal menghapus data kaderisasi', error },
      { status: 500 }
    );
  }
}
