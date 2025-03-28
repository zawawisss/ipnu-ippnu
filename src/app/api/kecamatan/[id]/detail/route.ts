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
      const desa = await Desa.find({ kecamatan_id: id });
      const totalDesa = await Desa.countDocuments({ kecamatan_id: id });
      const sekolah = await Sekolah.find({ kecamatan_id: id });
      const totalSekolah = await Sekolah.countDocuments({ kecamatan_id: id });
      const anggota = await Anggota.find({ kecamatan_id: id });
      const totalAnggota = await Anggota.countDocuments({ kecamatan_id: id });
  
      return Response.json({
        desa,
        sekolah,
        anggota,
        totalDesa,
        totalSekolah,
        totalAnggota,
      });
    } catch (error) {
      return new Response("Terjadi kesalahan server", { status: 500 });
    }
  }