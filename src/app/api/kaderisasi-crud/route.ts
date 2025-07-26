import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Kaderisasi from '@/models/Kaderisasi';

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const jenjangKader = searchParams.get('jenjangKader');
    const searchQuery = searchParams.get('search') || '';

    let query: any = {};
    if (jenjangKader) {
      query.jenjangKader = jenjangKader;
    }

    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      query = {
        ...query,
        $or: [
          { nama: { $regex: regex } },
          { komisariat: { $regex: regex } },
          { kecamatan: { $regex: regex } },
          { desa: { $regex: regex } },
          { nim: { $regex: regex } },
        ],
      };
    }

    const kaderisasiData = await Kaderisasi.find(query).limit(limit).skip(skip);
    const total = await Kaderisasi.countDocuments(query);

    return NextResponse.json({
      data: kaderisasiData,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Failed to fetch kaderisasi data:', error);
    return NextResponse.json({ error: 'Failed to fetch kaderisasi data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const newKaderisasi = new Kaderisasi(body);
    await newKaderisasi.save();
    return NextResponse.json(newKaderisasi, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create kaderisasi data:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required for updating' }, { status: 400 });
    }

    const updatedKaderisasi = await Kaderisasi.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!updatedKaderisasi) {
      return NextResponse.json({ error: 'Kaderisasi data not found' }, { status: 404 });
    }

    return NextResponse.json(updatedKaderisasi);
  } catch (error: any) {
    console.error('Failed to update kaderisasi data:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required for deleting' }, { status: 400 });
    }

    const deletedKaderisasi = await Kaderisasi.findByIdAndDelete(id);

    if (!deletedKaderisasi) {
      return NextResponse.json({ error: 'Kaderisasi data not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Kaderisasi data deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete kaderisasi data:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
