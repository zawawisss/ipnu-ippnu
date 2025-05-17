import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ArsipMasuk from '@/models/ArsipMasuk';
import { checkAdminSession } from '@/lib/checkAdminSession';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const allowedRoles = ['admin', 'ipnu_admin', 'ippnu_admin', 'superadmin'];
    const orgPrefix = 'ipnu';
    const session = await checkAdminSession(allowedRoles, orgPrefix);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const arsipMasuk = await ArsipMasuk.findById(id);

    if (!arsipMasuk) {
      return NextResponse.json({ message: 'Arsip Masuk not found' }, { status: 404 });
    }

    return NextResponse.json(arsipMasuk);
  } catch (error) {
    console.error('Error fetching arsip masuk:', error);
    return NextResponse.json({ message: 'Error fetching data' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const allowedRoles = ['admin', 'ipnu_admin', 'ippnu_admin', 'superadmin'];
    const orgPrefix = 'ipnu';
    const session = await checkAdminSession(allowedRoles, orgPrefix);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();

    const updatedArsipMasuk = await ArsipMasuk.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedArsipMasuk) {
      return NextResponse.json({ message: 'Arsip Masuk not found' }, { status: 404 });
    }

    return NextResponse.json(updatedArsipMasuk);
  } catch (error) {
    console.error('Error updating arsip masuk:', error);
    return NextResponse.json({ message: 'Error updating data' }, { status: 500 });
  }
}
