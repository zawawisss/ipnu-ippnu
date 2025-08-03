import { NextResponse } from 'next/server';
import db from '@/lib/db';
import mongoose from 'mongoose';

// Function to convert Excel serial date to JavaScript Date object
function excelSerialDateToJSDate(serial: number): Date {
  // Excel's epoch is Jan 1, 1900. It incorrectly treats 1900 as a leap year.
  // So, day 1 is Jan 1, 1900. Day 60 is Feb 29, 1900 (incorrectly).
  // Day 61 is Mar 1, 1900.
  // For simplicity and common usage, we'll use a standard epoch and adjust.
  // A common adjustment for Excel dates is to subtract 25569 (days from 1900-01-01 to 1970-01-01)
  // and then convert to milliseconds.
  const daysSinceEpoch = serial - 25569; // Days since 1970-01-01
  const ms = daysSinceEpoch * 24 * 60 * 60 * 1000;
  return new Date(ms);
}

export async function GET() {
  try {
    await db();

    const ipnuCollection = mongoose.connection.collection(
      'DATA_KADERISASI_IPNU'
    );
    const ippnuCollection = mongoose.connection.collection(
      'DATA_KADERISASI_IPPNU'
    );

    const ipnuData = await ipnuCollection.find({}).toArray();
    const ippnuData = await ippnuCollection.find({}).toArray();

    const monthlyDataMap = new Map<string, { ipnu: number; ippnu: number }>();

    const processData = (data: any[], organization: 'ipnu' | 'ippnu') => {
      data.forEach(doc => {
        if (
          doc.TANGGAL &&
          typeof doc.TANGGAL === 'number' &&
          doc.JUMLAH &&
          typeof doc.JUMLAH === 'number'
        ) {
          const date = excelSerialDateToJSDate(doc.TANGGAL);
          const year = date.getFullYear();
          const month = date.getMonth(); // 0-indexed
          const monthName = new Date(year, month).toLocaleString('id-ID', {
            month: 'short',
            year: 'numeric',
          });

          if (!monthlyDataMap.has(monthName)) {
            monthlyDataMap.set(monthName, { ipnu: 0, ippnu: 0 });
          }
          const currentMonthData = monthlyDataMap.get(monthName)!;
          currentMonthData[organization] += doc.JUMLAH;
        }
      });
    };

    processData(ipnuData, 'ipnu');
    processData(ippnuData, 'ippnu');

    const monthlyArray = Array.from(monthlyDataMap.entries()).map(
      ([monthName, counts]) => ({
        month: monthName,
        ipnu: counts.ipnu,
        ippnu: counts.ippnu,
        total: counts.ipnu + counts.ippnu,
      })
    );

    // Sort by date (need to re-parse month name to date for sorting)
    monthlyArray.sort((a, b) => {
      const dateA = new Date(a.month.replace(' ', ' 1, ')); // e.g., 'Jul 2025' -> 'Jul 1, 2025'
      const dateB = new Date(b.month.replace(' ', ' 1, '));
      return dateA.getTime() - dateB.getTime();
    });

    return NextResponse.json(monthlyArray);
  } catch (error) {
    console.error('Error fetching kaderisasi recap:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
