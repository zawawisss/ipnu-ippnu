import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Anggota from '@/models/Anggota';

export async function GET() {
  await dbConnect();

  try {
    // Hitung distribusi anggota berdasarkan tingkat pengkaderan
    const kaderisasiData = await Anggota.aggregate([
      {
        $group: {
          _id: {
            $toLower: {
              $cond: {
                if: { $in: ['$pengkaderan', [null, '', 'Belum', 'BELUM']] },
                then: 'belum',
                else: '$pengkaderan',
              },
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Konversi hasil ke format yang diinginkan
    let stats = {
      makesta: 0,
      lakmud: 0,
      lakut: 0,
      latin: 0,
      kader_terdistribusi: 0,
    };

    kaderisasiData.forEach(item => {
      const jenjang = item._id?.toLowerCase();
      switch (jenjang) {
        case 'makesta':
          stats.makesta = item.count;
          stats.kader_terdistribusi += item.count;
          break;
        case 'lakmud':
          stats.lakmud = item.count;
          stats.kader_terdistribusi += item.count;
          break;
        case 'lakut':
          stats.lakut = item.count;
          stats.kader_terdistribusi += item.count;
          break;
        case 'latin':
          stats.latin = item.count;
          stats.kader_terdistribusi += item.count;
          break;
        case 'diklatama':
          // Diklatama dihitung sebagai bagian dari kader terdistribusi
          stats.kader_terdistribusi += item.count;
          break;
      }
    });

    // Ambil juga data dari koleksi kaderisasi IPNU/IPPNU untuk data kegiatan
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    const [ipnuKaderisasi, ippnuKaderisasi] = await Promise.all([
      db
        .collection('DATA_KADERISASI_IPNU')
        .aggregate([
          {
            $group: {
              _id: '$PENGKADERAN',
              total_kegiatan: { $sum: 1 },
              total_peserta: { $sum: '$JUMLAH' },
            },
          },
        ])
        .toArray(),
      db
        .collection('DATA_KADERISASI_IPPNU')
        .aggregate([
          {
            $group: {
              _id: '$PENGKADERAN',
              total_kegiatan: { $sum: 1 },
              total_peserta: { $sum: '$JUMLAH' },
            },
          },
        ])
        .toArray(),
    ]);

    // Tambahkan informasi kegiatan kaderisasi
    const kegiatanData = {
      ipnu: ipnuKaderisasi,
      ippnu: ippnuKaderisasi,
    };

    return NextResponse.json({
      success: true,
      data: {
        anggota_stats: stats,
        kegiatan_stats: kegiatanData,
      },
    });
  } catch (error) {
    console.error('Failed to fetch kaderisasi stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kaderisasi statistics' },
      { status: 500 }
    );
  }
}
