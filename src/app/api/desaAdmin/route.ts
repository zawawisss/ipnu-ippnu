// src/app/api/desaAdmin/route.ts
import db from "@/lib/db";
import Desa from "@/models/Desa";
import Kecamatan from "@/models/Kecamatan"; // <--- Tambahkan impor model Kecamatan
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await db();
  try {
    const { searchParams } = new URL(req.url);
    const kecamatan_id = searchParams.get('kecamatan_id');
    const search_kecamatan = searchParams.get('search_kecamatan');

    let query: any = {};

    if (kecamatan_id && kecamatan_id !== 'undefined') {
      query.kecamatan_id = kecamatan_id;
    }

    let desaList;
    let total;

    if (search_kecamatan && !kecamatan_id) {
      const foundKecamatan = await Kecamatan.findOne({
        kecamatan: { $regex: search_kecamatan, $options: 'i' }
      });

      if (foundKecamatan) {
        query.kecamatan_id = foundKecamatan._id;
      } else {
        return NextResponse.json({ data: [], total: 0 });
      }
    }

    desaList = await Desa.find(query).sort({ /* sorting criteria */ }).populate('kecamatan_id');
    total = await Desa.countDocuments(query);

    return NextResponse.json({
      data: desaList,
      total,
    });
  } catch (error) {
    console.error('Failed to fetch desa list:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
