// src/app/api/events/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

// Inisialisasi koneksi database
dbConnect();

/**
 * GET  /api/events/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params; // tunggu hingga params ter-resolve :contentReference[oaicite:0]{index=0}

  try {
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve event', error },
      { status: 500 }
    );
  }
}

/**
 * PUT  /api/events/[id]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const body = await req.json();
    const {
      name,
      date,
      time,
      location,
      delegation,
      ipnuAttendees,
      ippnuAttendees,
    } = body;

    if (!name || !date || !time || !location || !delegation) {
      return NextResponse.json(
        { message: 'Semua field harus diisi, termasuk pendelegasian.' },
        { status: 400 }
      );
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        name,
        date,
        time,
        location,
        delegation,
        ipnuAttendees: ipnuAttendees || [],
        ippnuAttendees: ippnuAttendees || [],
      },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { message: 'Failed to update event', error },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/events/[id] - Untuk menambah peserta
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const body = await req.json();
    const { name, org } = body;

    if (!name || !org) {
      return NextResponse.json(
        { message: 'Nama dan organisasi diperlukan.' },
        { status: 400 }
      );
    }

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { message: 'Event tidak ditemukan' },
        { status: 404 }
      );
    }

    // Ensure arrays exist before checking
    event.ipnuAttendees = event.ipnuAttendees || [];
    event.ippnuAttendees = event.ippnuAttendees || [];

    // Cek apakah sudah terdaftar
    if (org === 'ipnu') {
      if (event.ipnuAttendees.includes(name)) {
        return NextResponse.json(
          { message: 'Anda sudah terdaftar pada acara ini.' },
          { status: 400 }
        );
      }
      if (event.ipnuAttendees.length >= 2) {
        return NextResponse.json(
          { message: 'Kuota IPNU sudah penuh.' },
          { status: 400 }
        );
      }
      event.ipnuAttendees.push(name);
    } else if (org === 'ippnu') {
      if (event.ippnuAttendees.includes(name)) {
        return NextResponse.json(
          { message: 'Anda sudah terdaftar pada acara ini.' },
          { status: 400 }
        );
      }
      if (event.ippnuAttendees.length >= 2) {
        return NextResponse.json(
          { message: 'Kuota IPPNU sudah penuh.' },
          { status: 400 }
        );
      }
      event.ippnuAttendees.push(name);
    } else {
      return NextResponse.json(
        { message: 'Organisasi tidak valid' },
        { status: 400 }
      );
    }

    const updatedEvent = await event.save();
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error('Error adding attendee:', error);
    return NextResponse.json(
      { message: 'Gagal menambahkan peserta', error },
      { status: 500 }
    );
  }
}

/**
 * DELETE  /api/events/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Event successfully deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { message: 'Failed to delete event', error },
      { status: 500 }
    );
  }
}
