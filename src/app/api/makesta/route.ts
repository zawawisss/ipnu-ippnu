import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import mongoose from 'mongoose';

// GET - Read all MAKESTA data
export async function GET() {
    try {
        await db();
        
        const ipnuCollection = mongoose.connection.collection('DATA_KADERISASI_IPNU');
        const ippnuCollection = mongoose.connection.collection('DATA_KADERISASI_IPPNU');

        // Get all data from both collections
        const ipnuData = await ipnuCollection.find({}).toArray();
        const ippnuData = await ippnuCollection.find({}).toArray();

        // Combine and format data
        const combinedData = [
            ...ipnuData.map((item: any) => ({ ...item, organisasi: 'IPNU', collection: 'ipnu' })),
            ...ippnuData.map((item: any) => ({ ...item, organisasi: 'IPPNU', collection: 'ippnu' }))
        ];

        // Sort by date
        combinedData.sort((a: any, b: any) => (b.TANGGAL || 0) - (a.TANGGAL || 0));

        return NextResponse.json(combinedData);

    } catch (error) {
        console.error('Error fetching MAKESTA data:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST - Create new MAKESTA data
export async function POST(request: NextRequest) {
    try {
        await db();
        
        const body = await request.json();
        const { organisasi, ...data } = body;

        // Validate required fields
        if (!organisasi || !data.TANGGAL || !data.PENGKADERAN || !data.PIMPINAN || !data.TEMPAT || !data.JUMLAH) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Determine collection based on organization
        const collection = organisasi === 'IPNU' 
            ? mongoose.connection.collection('DATA_KADERISASI_IPNU')
            : mongoose.connection.collection('DATA_KADERISASI_IPPNU');

        // Insert new data
        const result = await collection.insertOne({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return NextResponse.json({ 
            message: 'Data created successfully', 
            id: result.insertedId 
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating MAKESTA data:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT - Update MAKESTA data
export async function PUT(request: NextRequest) {
    try {
        await db();
        
        const body = await request.json();
        const { _id, organisasi, collection: collectionType, ...updateData } = body;

        if (!_id || !organisasi) {
            return NextResponse.json({ message: 'Missing ID or organization' }, { status: 400 });
        }

        // Determine collection
        const collection = organisasi === 'IPNU' 
            ? mongoose.connection.collection('DATA_KADERISASI_IPNU')
            : mongoose.connection.collection('DATA_KADERISASI_IPPNU');

        // Update data
        const result = await collection.updateOne(
            { _id: new mongoose.Types.ObjectId(_id) },
            { 
                $set: { 
                    ...updateData, 
                    updatedAt: new Date() 
                } 
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Data updated successfully' });

    } catch (error) {
        console.error('Error updating MAKESTA data:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE - Delete MAKESTA data
export async function DELETE(request: NextRequest) {
    try {
        await db();
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const organisasi = searchParams.get('organisasi');

        if (!id || !organisasi) {
            return NextResponse.json({ message: 'Missing ID or organization' }, { status: 400 });
        }

        // Determine collection
        const collection = organisasi === 'IPNU' 
            ? mongoose.connection.collection('DATA_KADERISASI_IPNU')
            : mongoose.connection.collection('DATA_KADERISASI_IPPNU');

        // Delete data
        const result = await collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Data deleted successfully' });

    } catch (error) {
        console.error('Error deleting MAKESTA data:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
