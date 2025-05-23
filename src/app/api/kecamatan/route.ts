import db from "@/lib/db";
import Database from "@/models/Kecamatan";
import { NextRequest, NextResponse } from "next/server";
// import { checkAdminSessionServer } from "@/lib/checkAdminSession"; // Import checkAdminSessionServer

export async function GET(req: NextRequest) {
    // const session = await checkAdminSessionServer(["admin", "ketua", "sekretaris"], "ipnu_"); // Tambahkan pengecekan sesi
    // if (!session) {
    //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    await db();
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        const data = await Database.find({}).limit(limit).skip(skip);
        const total = await Database.countDocuments({});

        return NextResponse.json({
            data,
            total,
            page,
            limit,
        });
    } catch (error) {
        console.error('Failed to fetch kecamatan data:', error);
        return NextResponse.json({ error: "Error" }, { status: 500 });
    }
}
