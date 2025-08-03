import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProgramKerja from '@/models/ProgramKerja';
import jwt from 'jsonwebtoken';

// Generate personal update link untuk setiap departemen
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { unit_name, organisasi = 'IPNU' } = await req.json();

    // Ambil semua program kerja untuk unit ini
    const programs = await ProgramKerja.find({
      unit_name: { $regex: new RegExp(unit_name, 'i') },
      organisasi,
      status: { $in: ['PERENCANAAN', 'BERJALAN'] } // Hanya yang masih aktif
    }).select('_id nama progress_percentage tanggal_selesai status');

    if (programs.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Tidak ada program kerja aktif untuk ${unit_name}`
      }, { status: 404 });
    }

    // Generate JWT token untuk authentication
    const token = jwt.sign(
      { 
        unit_name, 
        organisasi,
        programs: programs.map(p => p._id),
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 hari
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    );

    const updateLink = `${process.env.NEXT_PUBLIC_URL}/update-progress?token=${token}`;

    return NextResponse.json({
      success: true,
      data: {
        unit_name,
        programs_count: programs.length,
        update_link: updateLink,
        programs: programs.map(p => ({
          id: p._id,
          nama: p.nama,
          progress: p.progress_percentage,
          status: p.status
        }))
      }
    });

  } catch (error) {
    console.error('Generate update link error:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal generate link update'
    }, { status: 500 });
  }
}

// GET: Generate link untuk semua departemen sekaligus
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const organisasi = searchParams.get('organisasi') || 'IPNU';

    // Ambil semua unit yang punya program kerja aktif
    const units = await ProgramKerja.distinct('unit_name', {
      organisasi,
      status: { $in: ['PERENCANAAN', 'BERJALAN'] }
    });

    const results = [];

    for (const unit of units) {
      const programs = await ProgramKerja.find({
        unit_name: unit,
        organisasi,
        status: { $in: ['PERENCANAAN', 'BERJALAN'] }
      }).select('_id nama progress_percentage');

      const token = jwt.sign(
        { 
          unit_name: unit,
          organisasi,
          programs: programs.map(p => p._id),
          exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
        },
        process.env.NEXTAUTH_SECRET || 'fallback-secret'
      );

      const updateLink = `${process.env.NEXT_PUBLIC_URL}/update-progress?token=${token}`;

      results.push({
        unit_name: unit,
        programs_count: programs.length,
        update_link: updateLink,
        short_link: updateLink // Bisa dipendekkan dengan bit.ly nanti
      });
    }

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Generate all update links error:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal generate semua link update'
    }, { status: 500 });
  }
}
