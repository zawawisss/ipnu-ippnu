import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Kaderisasi from '@/models/Kaderisasi';

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const jenjangKader = searchParams.get('jenjangKader') || 'MAKESTA';
    const organizationType = searchParams.get('organization'); // 'IPNU' atau 'IPPNU'

    // Build query filter
    let query: any = { jenjangKader };
    if (
      organizationType &&
      (organizationType === 'IPNU' || organizationType === 'IPPNU')
    ) {
      query.organization = organizationType;
    }

    // Aggregation pipeline untuk mengelompokkan per kecamatan dengan hierarki komisariat dan ranting
    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: {
            kecamatan: '$kecamatan',
            komisariat: '$komisariat',
            desa: '$desa',
          },
          totalPeserta: { $sum: 1 },
          ipnuCount: {
            $sum: { $cond: [{ $eq: ['$organization', 'IPNU'] }, 1, 0] },
          },
          ippnuCount: {
            $sum: { $cond: [{ $eq: ['$organization', 'IPPNU'] }, 1, 0] },
          },
          aktifCount: {
            $sum: { $cond: [{ $eq: ['$statusKader', 'Aktif'] }, 1, 0] },
          },
          alumniCount: {
            $sum: { $cond: [{ $eq: ['$statusKader', 'Alumni'] }, 1, 0] },
          },
          tidakAktifCount: {
            $sum: { $cond: [{ $eq: ['$statusKader', 'Tidak Aktif'] }, 1, 0] },
          },
          peserta: {
            $push: {
              _id: '$_id',
              nama: '$nama',
              nim: '$nim',
              organization: '$organization',
              statusKader: '$statusKader',
              tanggalMulai: '$tanggalMulai',
              tanggalSelesai: '$tanggalSelesai',
              mentor: '$mentor',
              nilaiAkhir: '$nilaiAkhir',
              sertifikat: '$sertifikat',
            },
          },
        },
      },
      {
        $group: {
          _id: {
            kecamatan: '$_id.kecamatan',
            komisariat: '$_id.komisariat',
          },
          totalPeserta: { $sum: '$totalPeserta' },
          ipnuCount: { $sum: '$ipnuCount' },
          ippnuCount: { $sum: '$ippnuCount' },
          aktifCount: { $sum: '$aktifCount' },
          alumniCount: { $sum: '$alumniCount' },
          tidakAktifCount: { $sum: '$tidakAktifCount' },
          ranting: {
            $push: {
              name: '$_id.desa',
              totalPeserta: '$totalPeserta',
              ipnuCount: '$ipnuCount',
              ippnuCount: '$ippnuCount',
              peserta: '$peserta',
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id.kecamatan',
          totalPeserta: { $sum: '$totalPeserta' },
          ipnuCount: { $sum: '$ipnuCount' },
          ippnuCount: { $sum: '$ippnuCount' },
          aktifCount: { $sum: '$aktifCount' },
          alumniCount: { $sum: '$alumniCount' },
          tidakAktifCount: { $sum: '$tidakAktifCount' },
          komisariat: {
            $push: {
              name: '$_id.komisariat',
              totalPeserta: '$totalPeserta',
              ipnuCount: '$ipnuCount',
              ippnuCount: '$ippnuCount',
              ranting: '$ranting',
            },
          },
        },
      },
      {
        $project: {
          kecamatan: '$_id',
          totalPeserta: 1,
          ipnuCount: 1,
          ippnuCount: 1,
          aktifCount: 1,
          alumniCount: 1,
          tidakAktifCount: 1,
          komisariat: 1,
          _id: 0,
        },
      },
      { $sort: { kecamatan: 1 as 1 } },
    ];

    const result = await Kaderisasi.aggregate(pipeline);

    // Calculate overall statistics
    const overallStats = {
      totalKecamatan: result.length,
      totalPeserta: result.reduce((sum, item) => sum + item.totalPeserta, 0),
      totalIPNU: result.reduce((sum, item) => sum + item.ipnuCount, 0),
      totalIPPNU: result.reduce((sum, item) => sum + item.ippnuCount, 0),
      totalAktif: result.reduce((sum, item) => sum + item.aktifCount, 0),
      totalAlumni: result.reduce((sum, item) => sum + item.alumniCount, 0),
      totalTidakAktif: result.reduce(
        (sum, item) => sum + item.tidakAktifCount,
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: result,
      overallStats,
      jenjangKader,
      organization: organizationType || 'ALL',
    });
  } catch (error) {
    console.error('Failed to fetch kaderisasi data by kecamatan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kaderisasi data by kecamatan' },
      { status: 500 }
    );
  }
}
