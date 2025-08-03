import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ArsipKeluar from '@/models/ArsipKeluar';

export function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  return new Promise(async (resolve, reject) => {
    const { id } = await params;

    try {
      await dbConnect();
      const arsipKeluar = await ArsipKeluar.findById(id);

      if (!arsipKeluar) {
        resolve(
          NextResponse.json(
            { message: 'Arsip Keluar not found' },
            { status: 404 }
          )
        );
        return;
      }

      resolve(NextResponse.json(arsipKeluar));
    } catch (error) {
      console.error('Error fetching arsip keluar:', error);
      resolve(
        NextResponse.json({ message: 'Error fetching data' }, { status: 500 })
      );
    }
  });
}

export function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  return new Promise(async (resolve, reject) => {
    const { id } = await params;

    try {
      await dbConnect();
      const body = await request.json();

      const updatedArsipKeluar = await ArsipKeluar.findByIdAndUpdate(id, body, {
        new: true,
      });

      if (!updatedArsipKeluar) {
        resolve(
          NextResponse.json(
            { message: 'Arsip Keluar not found' },
            { status: 404 }
          )
        );
        return;
      }

      resolve(NextResponse.json(updatedArsipKeluar));
    } catch (error) {
      console.error('Error updating arsip keluar:', error);
      resolve(
        NextResponse.json({ message: 'Error updating data' }, { status: 500 })
      );
    }
  });
}

export function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  return new Promise(async (resolve, reject) => {
    const { id } = await params;

    try {
      await dbConnect();
      const deletedArsipKeluar = await ArsipKeluar.findByIdAndDelete(id);

      if (!deletedArsipKeluar) {
        resolve(
          NextResponse.json(
            { message: 'Arsip Keluar not found' },
            { status: 404 }
          )
        );
        return;
      }

      resolve(
        NextResponse.json({ message: 'Arsip Keluar deleted successfully' })
      );
    } catch (error) {
      console.error('Error deleting arsip keluar:', error);
      resolve(
        NextResponse.json({ message: 'Error deleting data' }, { status: 500 })
      );
    }
  });
}
