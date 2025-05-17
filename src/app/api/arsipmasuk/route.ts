import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ArsipMasuk from '@/models/ArsipMasuk';
import { checkAdminSession } from '@/lib/checkAdminSession';

export async function GET(request: Request) {
  try {
    const allowedRoles = ['admin', 'ipnu_admin', 'ippnu_admin', 'superadmin'];
    const orgPrefix = 'ipnu';
    const session = await checkAdminSession(allowedRoles, orgPrefix);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';

    let query: any = {};

    if (searchQuery) {
      // Create a case-insensitive regex for searching across relevant fields
      const regex = new RegExp(searchQuery, 'i');
      query = {
        $or: [
          { nomor_surat: { $regex: regex } },
          { pengirim: { $regex: regex } },
          { perihal: { $regex: regex } },
        ],
      };
    }

    const arsipMasuk = await ArsipMasuk.find(query);
    return NextResponse.json(arsipMasuk);
  } catch (error: any) {
    console.error('Error fetching arsip masuk:', error);
    return NextResponse.json({ message: 'Error fetching data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const allowedRoles = ['admin', 'ipnu_admin', 'ippnu_admin', 'superadmin'];
    const orgPrefix = 'ipnu';
    const session = await checkAdminSession(allowedRoles, orgPrefix);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { no, nomor_surat, pengirim, perihal, tanggal_surat } = body;

    const newArsipMasuk = new ArsipMasuk({
      no,
      nomor_surat,
      pengirim,
      perihal,
      tanggal_surat,
    });

    const savedArsipMasuk = await newArsipMasuk.save();

    return NextResponse.json(savedArsipMasuk);
  } catch (error) {
    console.error('Error saving arsip masuk:', error);
    return NextResponse.json({ message: 'Error saving data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const allowedRoles = ['admin', 'ipnu_admin', 'ippnu_admin', 'superadmin'];
    const orgPrefix = 'ipnu';
    const session = await checkAdminSession(allowedRoles, orgPrefix);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing id parameter' }, { status: 400 });
    }

    const deletedArsipMasuk = await ArsipMasuk.findByIdAndDelete(id);

    if (!deletedArsipMasuk) {
      return NextResponse.json({ message: 'Arsip Masuk not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Arsip Masuk deleted successfully' });
  } catch (error) {
    console.error('Error deleting arsip masuk:', error);
    return NextResponse.json({ message: 'Error deleting data' }, { status: 500 });
  }
}