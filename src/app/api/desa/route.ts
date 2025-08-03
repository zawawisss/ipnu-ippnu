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
    const getAll = searchParams.get('all') === 'true';
    const search = searchParams.get('search') || ''; // Add search parameter

    let desa;
    let total;
    let page = parseInt(searchParams.get('page') || '1'); // Default page
    let limit = parseInt(searchParams.get('limit') || '10'); // Default limit

    // Build query filter based on search parameter
    let queryFilter = {};
    if (search.trim()) {
      queryFilter = {
        $or: [
          { nama_desa: { $regex: search, $options: 'i' } }, // Case-insensitive search on nama_desa
          { status_sp: { $regex: search, $options: 'i' } }, // Case-insensitive search on status_sp
          { nomor_sp: { $regex: search, $options: 'i' } }, // Case-insensitive search on nomor_sp
        ],
      };
    }

    if (getAll) {
      desa = await Desa.find(queryFilter);
      total = desa.length; // Count all documents if not paginating
      page = 1; // Set to a default value, as it's not paginated
      limit = total; // Set limit to total to indicate all data
    } else {
      const skip = (page - 1) * limit;
      desa = await Desa.find(queryFilter).limit(limit).skip(skip);
      total = await Desa.countDocuments(queryFilter);
    }

    return NextResponse.json({
      data: desa,
      total,
      page,
      limit,
      search, // Include search parameter in response
    });
  } catch (error) {
    console.error('Failed to fetch desa data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch desa data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // const session = await checkAdminSessionServer(["admin", "ketua", "sekretaris"], "ipnu_");
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Desa ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updatedDesa = await Desa.findByIdAndUpdate(id, body, { new: true });

    if (!updatedDesa) {
      return NextResponse.json({ message: 'Desa not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Desa updated successfully',
      data: updatedDesa,
    });
  } catch (error) {
    console.error('Failed to update desa data:', error);
    return NextResponse.json(
      { error: 'Failed to update desa data' },
      { status: 500 }
    );
  }
}
