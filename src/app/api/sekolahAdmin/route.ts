// src/app/api/sekolahAdmin/route.ts
import db from "@/lib/db";
import Sekolah from "@/models/Sekolah"; // Impor model Sekolah
import Kecamatan from "@/models/Kecamatan"; // Impor model Kecamatan untuk populate
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await db(); // Pastikan koneksi database terjalin
  try {
    const { searchParams } = new URL(req.url);
    const kecamatan_id = searchParams.get('kecamatan_id');
    const search_kecamatan = searchParams.get('search_kecamatan'); // Untuk filter autocomplete

    let query: any = {};

    if (kecamatan_id && kecamatan_id !== 'undefined') {
      query.kecamatan_id = kecamatan_id;
    }

    let sekolahList;
    let total;

    if (search_kecamatan && !kecamatan_id) {
      // Jika ada search_kecamatan dan tidak ada kecamatan_id spesifik,
      // cari ID kecamatan berdasarkan nama, lalu filter sekolah.
      const foundKecamatan = await Kecamatan.findOne({
        kecamatan: { $regex: search_kecamatan, $options: 'i' } // Case-insensitive search
      });

      if (foundKecamatan) {
        query.kecamatan_id = foundKecamatan._id;
      } else {
        // Jika tidak ada kecamatan yang ditemukan, kembalikan array kosong
        return NextResponse.json({ data: [], total: 0 });
      }
    }

    sekolahList = await Sekolah.find(query).sort({ /* sorting criteria */ }).populate('kecamatan_id');
    total = await Sekolah.countDocuments(query);

    return NextResponse.json({
      data: sekolahList,
      total,
    });
  } catch (error) {
    console.error('Failed to fetch sekolah list:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// Metode POST (Opsional: untuk menambahkan data sekolah baru jika diperlukan)
// export async function POST(req: NextRequest) {
//   await db();
//   try {
//     const body = await req.json();
//     const newSekolah = await Sekolah.create(body);
//     return NextResponse.json(newSekolah, { status: 201 });
//   } catch (error: any) {
//     console.error("Error creating sekolah:", error);
//     if (error.name === 'ValidationError') {
//       return NextResponse.json(
//         { message: "Validasi gagal.", errors: error.errors },
//         { status: 400 }
//       );
//     }
//     return NextResponse.json(
//       { message: "Gagal menambahkan data sekolah.", error: error.message },
//       { status: 500 }
//     );
//   }
// }
