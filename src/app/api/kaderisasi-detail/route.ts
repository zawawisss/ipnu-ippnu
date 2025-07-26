import { NextResponse } from 'next/server';
import db from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await db();

        const ipnuCollection = mongoose.connection.collection('DATA_KADERISASI_IPNU');
        const ippnuCollection = mongoose.connection.collection('DATA_KADERISASI_IPPNU');

        const ipnuData = await ipnuCollection.find({}).toArray();
        const ippnuData = await ippnuCollection.find({}).toArray();

        const combinedData = [
            ...ipnuData.map(doc => ({ ...doc, organization: 'IPNU' })),
            ...ippnuData.map(doc => ({ ...doc, organization: 'IPPNU' }))
        ];

        // Sort by TANGGAL (assuming it's a number representing Excel date serial)
        combinedData.sort((a, b) => a.TANGGAL - b.TANGGAL);

        return NextResponse.json(combinedData);

    } catch (error) {
        console.error('Error fetching kaderisasi detail:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
