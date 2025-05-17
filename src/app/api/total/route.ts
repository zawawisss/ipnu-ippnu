import db from "@/lib/db";
import Anggota from "@/models/Anggota";
import Desa from "@/models/Desa";
import Kecamatan from "@/models/Kecamatan";
import Sekolah from "@/models/Sekolah";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await db();
    try {
        const [totalKecamatan, totalDesa, totalSekolahMaarif, totalAnggota] = await Promise.all([
            Kecamatan.countDocuments(),
            Desa.countDocuments(),
            Sekolah.countDocuments(),
            Anggota.countDocuments(),
        ]);

        return NextResponse.json({
            totalKecamatan,
            totalDesa,
            totalSekolahMaarif,
            totalAnggota,
        });
    } catch (error) {
        console.error('Failed to fetch total counts:', error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
