import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Sekolah from '@/models/Sekolah';
// import { checkAdminSessionServer } from "@/lib/checkAdminSession"; // Import checkAdminSessionServer

export async function GET(request: NextRequest) {
  // const session = await checkAdminSessionServer(["admin", "ketua", "sekretaris"], "ipnu_"); // Tambahkan pengecekan sesi
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const searchQuery = searchParams.get('search') || ''; // Mendapatkan parameter pencarian

    let query: any = {};
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i'); // Case-insensitive regex
      query = {
        $or: [
          { sekolah_maarif: { $regex: regex } }, // Pencarian berdasarkan nama sekolah
          { nomor_sp: { $regex: regex } }, // Pencarian berdasarkan nomor SP
        ],
      };
    }

    const sekolah = await Sekolah.find(query).limit(limit).skip(skip);
    const total = await Sekolah.countDocuments(query); // Menerapkan filter pencarian juga pada total count

    return NextResponse.json({
      data: sekolah,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Failed to fetch sekolah data:', error);
    return NextResponse.json({ error: 'Failed to fetch sekolah data' }, { status: 500 });
  }
}
