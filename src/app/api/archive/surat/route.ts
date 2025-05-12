import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ArchivedLetter from '@/models/ArchivedLetter';

export async function GET() {
  await dbConnect();

  try {
    const archivedLetters = await ArchivedLetter.find({});
    return NextResponse.json(archivedLetters);
  } catch (error) {
    console.error('Error fetching archived letters:', error);
    return NextResponse.json({ error: 'Failed to fetch archived letters' }, { status: 500 });
  }
}
