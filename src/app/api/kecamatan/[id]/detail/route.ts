import db from "@/lib/db";
import Anggota from "@/models/Anggota";
import Desa from "@/models/Desa";
import Sekolah from "@/models/Sekolah";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
  ) {
    await db();
    const { id } = await context.params;
  
    // Validasi ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response("ID tidak valid", { status: 400 });
    }
  
    try {
      const [desa, totalDesa, sekolah, totalSekolah, anggota, totalAnggota] = await Promise.all([
        Desa.find({ kecamatan_id: id }),
        Desa.countDocuments({ kecamatan_id: id }),
        Sekolah.find({ kecamatan_id: id }),
        Sekolah.countDocuments({ kecamatan_id: id }),
        Anggota.find({ kecamatan_id: id }),
        Anggota.countDocuments({ kecamatan_id: id }),
      ]);
  
      return Response.json({
        desa,
        sekolah,
        anggota,
        totalDesa,
        totalSekolah,
        totalAnggota,
      });
    } catch (error) {
      console.error('Error fetching kecamatan detail:', error);
      return new Response("Terjadi kesalahan server", { status: 500 });
    }
  }
