import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ArsipMasuk from '@/models/ArsipMasuk';

const allowedRoles = [
  'ipnu_ketua',
  'ipnu_admin',
  'ippnu_admin',
  'ipnu_sekretaris',
  'ippnu_sekretaris',
  'ippnu_ketua',
];

type Params = Promise<{ id: string }>;

export function GET(
  request: Request,
  { params }: { params: Params }
): Promise<NextResponse> {
  return new Promise(async (resolve, reject) => {
    const { id } = await params;

    try {
      await dbConnect();
      const arsipMasuk = await ArsipMasuk.findById(id);
      if (!arsipMasuk) {
        resolve(
          NextResponse.json(
            { message: 'Arsip Masuk not found' },
            { status: 404 }
          )
        );
        return;
      }
      resolve(NextResponse.json(arsipMasuk));
    } catch (error) {
      console.error('Failed to fetch arsip masuk:', error);
      resolve(
        NextResponse.json({ message: 'Error fetching data' }, { status: 500 })
      );
    }
  });
}

export function PUT(
  request: Request,
  { params }: { params: Params }
): Promise<NextResponse> {
  return new Promise(async (resolve, reject) => {
    const { id } = await params;

    try {
      await dbConnect();
      const body = await request.json();
      const updatedArsipMasuk = await ArsipMasuk.findByIdAndUpdate(id, body, {
        new: true,
      });

      if (!updatedArsipMasuk) {
        resolve(
          NextResponse.json(
            { message: 'Arsip Masuk not found' },
            { status: 404 }
          )
        );
        return;
      }
      resolve(NextResponse.json(updatedArsipMasuk));
    } catch (error) {
      console.error('Error updating arsip masuk:', error);
      resolve(
        NextResponse.json({ message: 'Error updating data' }, { status: 500 })
      );
    }
  });
}
