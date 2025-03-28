import db from "@/lib/db";
import Anggota from "@/models/Anggota";
import Desa from "@/models/Desa";
import Kecamatan from "@/models/Kecamatan";
import Sekolah from "@/models/Sekolah";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    await db();
    try {
        const totalKecamatan = await Kecamatan.countDocuments();
        const totalDesa = await Desa.countDocuments();
        const totalSekolahMaarif = await Sekolah.countDocuments();
        const totalAnggota = await Anggota.countDocuments();

        return NextResponse.json({
            totalKecamatan,
            totalDesa,
            totalSekolahMaarif,
            totalAnggota,
        });
    }catch (error){
        return NextResponse.json({error}, {status: 500});
    }
}