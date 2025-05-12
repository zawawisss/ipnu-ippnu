import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LetterSequence from '@/models/LetterSequence';

export async function POST(request: Request) {
  await dbConnect();

  const { letterType } = await request.json();

  if (!letterType) {
    return NextResponse.json({ error: 'letterType is required' }, { status: 400 });
  }

  try {
    const sequence = await LetterSequence.findOneAndUpdate(
      { letterType: letterType },
      { $inc: { lastSequenceNumber: 1 } },
      { new: true, upsert: true } // Create if not exists, return new document
    );

    return NextResponse.json({ sequentialNumber: sequence.lastSequenceNumber });
  } catch (error) {
    console.error('Error getting next sequence number:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
