import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Kecamatan from '@/models/Kecamatan';
// import { checkAdminSessionServer } from "@/lib/checkAdminSession"; // Import checkAdminSessionServer

export async function GET(req: NextRequest) {
  // const session = await checkAdminSessionServer(["admin", "ketua", "sekretaris"], "ipnu_"); // Tambahkan pengecekan sesi
  // if (!session) {
  //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const searchQuery = searchParams.get('search') || ''; // Mendapatkan parameter pencarian

    let query: any = {};
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i'); // Case-insensitive regex
      query = {
        $or: [
          { kecamatan: { $regex: regex } }, // Pencarian berdasarkan nama kecamatan
          { nomor_sp: { $regex: regex } }, // Pencarian berdasarkan nomor SP
        ],
      };
    }

    const data = await Kecamatan.find(query).limit(limit).skip(skip);
    const total = await Kecamatan.countDocuments(query); // Menerapkan filter pencarian juga pada total count

    return NextResponse.json({
      data,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Failed to fetch kecamatan data:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
