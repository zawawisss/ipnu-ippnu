import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Desa from '@/models/Desa';
// import { checkAdminSessionServer } from "@/lib/checkAdminSession";

export async function GET(request: NextRequest) {
  // const session = await checkAdminSessionServer(["admin", "ketua", "sekretaris"], "ipnu_");
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const desa = await Desa.find({}).limit(limit).skip(skip);
    const total = await Desa.countDocuments({});

    return NextResponse.json({
      data: desa,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Failed to fetch desa data:', error);
    return NextResponse.json({ error: 'Failed to fetch desa data' }, { status: 500 });
  }
}
