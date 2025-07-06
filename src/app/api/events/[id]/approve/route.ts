import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  try {
    const { name, org, action } = await req.json();

    if (!name || !org || !action) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ message: 'Event tidak ditemukan' }, { status: 404 });
    }

    if (org === 'ipnu') {
      // Remove from pending
      event.pendingIpnu = event.pendingIpnu.filter((n: string) => n !== name);
      // Add to attendees if approved and not already there
      if (action === 'approve' && !event.ipnuAttendees.includes(name)) {
        event.ipnuAttendees.push(name);
      }
    } else if (org === 'ippnu') {
      // Remove from pending
      event.pendingIppnu = event.pendingIppnu.filter((n: string) => n !== name);
      // Add to attendees if approved and not already there
      if (action === 'approve' && !event.ippnuAttendees.includes(name)) {
        event.ippnuAttendees.push(name);
      }
    } else {
      return NextResponse.json({ message: 'Organisasi tidak valid' }, { status: 400 });
    }

    await event.save();
    return NextResponse.json(event, { status: 200 });

  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json({ message: 'Gagal memproses permintaan' }, { status: 500 });
  }
}
