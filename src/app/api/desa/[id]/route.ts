import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Desa from '@/models/Desa';
// import { checkAdminSessionServer } from "@/lib/checkAdminSession";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // const session = await checkAdminSessionServer(["admin", "ketua", "sekretaris"], "ipnu_");
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  await dbConnect();
  try {
    const { id } = params;
    const desa = await Desa.findById(id);

    if (!desa) {
      return NextResponse.json({ message: 'Desa not found' }, { status: 404 });
    }

    return NextResponse.json({ data: desa });
  } catch (error) {
    console.error('Failed to fetch desa data:', error);
    return NextResponse.json({ error: 'Failed to fetch desa data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // const session = await checkAdminSessionServer(["admin", "ketua", "sekretaris"], "ipnu_");
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  await dbConnect();
  try {
    const { id } = params;
    const body = await request.json();
    const updatedDesa = await Desa.findByIdAndUpdate(id, body, { new: true });

    if (!updatedDesa) {
      return NextResponse.json({ message: 'Desa not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Desa updated successfully', data: updatedDesa });
  } catch (error) {
    console.error('Failed to update desa data:', error);
    return NextResponse.json({ error: 'Failed to update desa data' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // const session = await checkAdminSessionServer(["admin", "ketua", "sekretaris"], "ipnu_");
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  await dbConnect();
  try {
    const { id } = params;
    const deletedDesa = await Desa.findByIdAndDelete(id);

    if (!deletedDesa) {
      return NextResponse.json({ message: 'Desa not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Desa deleted successfully' });
  } catch (error) {
    console.error('Failed to delete desa data:', error);
    return NextResponse.json({ error: 'Failed to delete desa data' }, { status: 500 });
  }
}
