import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ArsipKeluar from '@/models/ArsipKeluar';
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
          { indeks: { $regex: regex } },
          { nomor_surat: { $regex: regex } },
          { tujuan: { $regex: regex } },
          { perihal: { $regex: regex } },
        ],
      };
    }

    const arsipKeluar = await ArsipKeluar.find(query);
    return NextResponse.json(arsipKeluar);
  } catch (error) {
    console.error('Error fetching arsip keluar:', error);
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
    const { no, indeks, nomor_surat, tujuan, perihal } = body;

    const newArsipKeluar = new ArsipKeluar({
      no,
      indeks,
      nomor_surat,
      tujuan,
      perihal,
    });

    const savedArsipKeluar = await newArsipKeluar.save();

    return NextResponse.json(savedArsipKeluar);
  } catch (error) {
    console.error('Error saving arsip keluar:', error);
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

    const deletedArsipKeluar = await ArsipKeluar.findByIdAndDelete(id);

    if (!deletedArsipKeluar) {
      return NextResponse.json({ message: 'Arsip Keluar not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Arsip Keluar deleted successfully' });
  } catch (error) {
    console.error('Error deleting arsip keluar:', error);
    return NextResponse.json({ message: 'Error deleting data' }, { status: 500 });
  }
}