import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event'; // Import model Event

// Koneksikan ke database
dbConnect();

// Handler untuk request GET berdasarkan ID (mendapatkan event tunggal)
export function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  
  return Event.findById(id)
    .then(event => {
      if (!event) {
        return NextResponse.json({ message: 'Event tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json(event, { status: 200 });
    })
    .catch(error => {
      console.error('Error fetching event by ID:', error);
      return NextResponse.json({ message: 'Gagal mengambil event', error }, { status: 500 });
    });
}

// Handler untuk request PUT (mengupdate event)
export function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  
  return req.json()
    .then(body => {
      const { name, date, time, location, ipnuAttendees, ippnuAttendees } = body;

      // Validasi input dasar
      if (!name || !date || !time || !location) {
        return NextResponse.json({ message: 'Nama, tanggal, waktu, dan lokasi event harus diisi.' }, { status: 400 });
      }

      return Event.findByIdAndUpdate(
        id,
        {
          name,
          date,
          time,
          location,
          ipnuAttendees: ipnuAttendees || [],
          ippnuAttendees: ippnuAttendees || [],
        },
        { new: true, runValidators: true }
      );
    })
    .then(updatedEvent => {
      if (!updatedEvent) {
        return NextResponse.json({ message: 'Event tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json(updatedEvent, { status: 200 });
    })
    .catch(error => {
      console.error('Error updating event:', error);
      return NextResponse.json({ message: 'Gagal mengupdate event', error }, { status: 500 });
    });
}

// Handler untuk request DELETE (menghapus event)
export function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  
  return Event.findByIdAndDelete(id)
    .then(deletedEvent => {
      if (!deletedEvent) {
        return NextResponse.json({ message: 'Event tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Event berhasil dihapus' }, { status: 200 });
    })
    .catch(error => {
      console.error('Error deleting event:', error);
      return NextResponse.json({ message: 'Gagal menghapus event', error }, { status: 500 });
    });
}
