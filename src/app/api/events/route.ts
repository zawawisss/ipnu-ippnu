import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event'; // Import model Event yang baru dibuat

// Koneksikan ke database
dbConnect();

// Handler untuk request GET (mendapatkan semua event)
export async function GET(req: NextRequest) {
  try {
    // Ambil semua event dari database, urutkan berdasarkan tanggal dan waktu
    const events = await Event.find({}).sort({ date: 1, time: 1 });
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ message: 'Gagal mengambil event', error }, { status: 500 });
  }
}

// Handler untuk request POST (menambahkan event baru)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, date, time, location, ipnuAttendees, ippnuAttendees } = body;

    // Validasi input dasar
    if (!name || !date || !time || !location) {
      return NextResponse.json({ message: 'Nama, tanggal, waktu, dan lokasi event harus diisi.' }, { status: 400 });
    }

    // Buat event baru
    const newEvent = new Event({
      name,
      date,
      time,
      location,
      ipnuAttendees: ipnuAttendees || [], // Pastikan array jika tidak disediakan
      ippnuAttendees: ippnuAttendees || [],
    });

    await newEvent.save(); // Simpan event ke database

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ message: 'Gagal membuat event baru', error }, { status: 500 });
  }
}

