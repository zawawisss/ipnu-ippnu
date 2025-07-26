import { NextResponse } from 'next/server';
import db from '@/lib/db';
import mongoose from 'mongoose';

// Helper function to extract type and base name
function extractPimpinanInfo(pimpinan: string | null): { type: string, base: string } | null {
    if (!pimpinan) return null;
    const prefixes = [
        { type: 'PR', prefix: 'PR IPNU ', ippnuPrefix: 'PR IPPNU ' },
        { type: 'PAC', prefix: 'PAC IPNU ', ippnuPrefix: 'PAC IPPNU ' },
        { type: 'PK', prefix: 'PK IPNU ', ippnuPrefix: 'PK IPPNU ' },
    ];

    for (const p of prefixes) {
        if (pimpinan.startsWith(p.prefix)) {
            return { type: p.type, base: pimpinan.substring(p.prefix.length) };
        } else if (pimpinan.startsWith(p.ippnuPrefix)) {
            return { type: p.type, base: pimpinan.substring(p.ippnuPrefix.length) };
        }
    }
    return { type: '', base: pimpinan }; // Fallback if no known prefix
}

export async function GET() {
    try {
        await db();

        const ipnuCollection = mongoose.connection.collection('DATA_KADERISASI_IPNU');
        const ippnuCollection = mongoose.connection.collection('DATA_KADERISASI_IPPNU');

        const ipnuData = await ipnuCollection.find({}).toArray();
        const ippnuData = await ippnuCollection.find({}).toArray();

        const groupedData = new Map();

        const processAndGroup = (data: any[], organization: 'IPNU' | 'IPPNU') => {
            data.forEach(doc => {
                // Grouping key without PIMPINAN
                const key = `${doc.TANGGAL}-${doc.PENGKADERAN}-${doc.TEMPAT}`;
                if (!groupedData.has(key)) {
                    groupedData.set(key, {
                        id: key,
                        TANGGAL: doc.TANGGAL,
                        PENGKADERAN: doc.PENGKADERAN,
                        TEMPAT: doc.TEMPAT,
                        PIMPINAN_IPNU: null,
                        PIMPINAN_IPPNU: null,
                        JUMLAH_IPNU: 0,
                        JUMLAH_IPPNU: 0,
                        TOTAL_JUMLAH: 0,
                    });
                }
                const currentEntry = groupedData.get(key);
                if (organization === 'IPNU') {
                    currentEntry.JUMLAH_IPNU += doc.JUMLAH;
                    currentEntry.PIMPINAN_IPNU = doc.PIMPINAN;
                } else {
                    currentEntry.JUMLAH_IPPNU += doc.JUMLAH;
                    currentEntry.PIMPINAN_IPPNU = doc.PIMPINAN;
                }
                currentEntry.TOTAL_JUMLAH += doc.JUMLAH;
            });
        };

        processAndGroup(ipnuData, 'IPNU');
        processAndGroup(ippnuData, 'IPPNU');

        const combinedAndGroupedData = Array.from(groupedData.values()).map(entry => {
            const ipnuInfo = extractPimpinanInfo(entry.PIMPINAN_IPNU);
            const ippnuInfo = extractPimpinanInfo(entry.PIMPINAN_IPPNU);

            let combinedPimpinan = '';

            if (ipnuInfo && ippnuInfo && ipnuInfo.base === ippnuInfo.base && ipnuInfo.type === ippnuInfo.type) {
                // Both exist, same base and type (e.g., PR IPNU Gandu & PR IPPNU Gandu)
                if (ipnuInfo.type) {
                    combinedPimpinan = `${ipnuInfo.type} IPNU & IPPNU ${ipnuInfo.base}`;
                } else {
                    combinedPimpinan = `IPNU & IPPNU ${ipnuInfo.base}`;
                }
            } else if (ipnuInfo && ippnuInfo) {
                // Both exist, but different base or type
                combinedPimpinan = `${entry.PIMPINAN_IPNU} & ${entry.PIMPINAN_IPPNU}`;
            } else if (ipnuInfo) {
                // Only IPNU exists
                combinedPimpinan = entry.PIMPINAN_IPNU;
            } else if (ippnuInfo) {
                // Only IPPNU exists
                combinedPimpinan = entry.PIMPINAN_IPPNU;
            }

            return {
                ...entry,
                PIMPINAN: combinedPimpinan,
                PIMPINAN_IPNU: undefined, // Remove these from final output
                PIMPINAN_IPPNU: undefined,
            };
        });

        // Sort by TANGGAL
        combinedAndGroupedData.sort((a, b) => a.TANGGAL - b.TANGGAL);

        return NextResponse.json(combinedAndGroupedData);

    } catch (error) {
        console.error('Error fetching kaderisasi detail:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}