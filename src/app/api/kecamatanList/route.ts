//app/api/kecamatanList/route.ts
import db from "@/lib/db";
import Kecamatan from "@/models/Kecamatan";
import { NextRequest, NextResponse } from "next/server";
// import { checkAdminSessionServer } from "@/lib/checkAdminSession"; // Import checkAdminSessionServer

export async function GET(req: NextRequest) {
    // const session = await checkAdminSessionServer(["admin", "ketua", "sekretaris"], "ipnu_"); // Tambahkan pengecekan sesi
    // if (!session) {
    //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    await db();
    try {
        const { searchParams } = new URL(req.url);
        // Default limit to 5 to match frontend's default rowsPerPage
        const limit = parseInt(searchParams.get('limit') || '21');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;
        const searchTerm = searchParams.get('searchTerm') || '';

        const filter = searchTerm ? {
            kecamatan: { $regex: searchTerm, $options: 'i' }
        } : {};

        const kecamatanList = await Kecamatan.aggregate([
            { $match: filter },
            { $addFields: {
                // Menggunakan $let untuk mendefinisikan variabel untuk tanggal akhir yang dikonversi
                status: {
                    $cond: [
                        { $not: ["$tanggal_sp"] }, // Diubah dari tanggal_berakhir menjadi tanggal_sp
                        "3", // Tanpa tanggal - urutkan terakhir
                        {
                            $let: {
                                vars: { 
                                    // Mengonversi tanggal_sp menjadi objek Date
                                    endDate: { $toDate: "$tanggal_sp" } 
                                },
                                in: {
                                    $cond: [
                                        // Membandingkan tanggal saat ini dengan endDate dikurangi 14 hari (dalam milidetik)
                                        { $lt: [new Date(), { $subtract: ["$$endDate", 14 * 24 * 60 * 60 * 1000] }] },
                                        "0", // Aktif
                                        {
                                            $cond: [
                                                // Membandingkan tanggal saat ini dengan endDate
                                                { $lt: [new Date(), "$$endDate"] },
                                                "1", // Hampir Berakhir
                                                "2"  // Tidak Aktif
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            }},
            { $sort: { status: 1, kecamatan: 1 } },
            { $skip: skip },
            { $limit: limit }
        ]);
        const total = await Kecamatan.countDocuments(filter);

        return NextResponse.json({
            data: kecamatanList,
            total,
            page,
            limit,
        });
    } catch (error: any) {
        console.error('Failed to fetch kecamatan list:', error);
        console.error('Error stack:', error.stack); // Log the stack trace
        // Mengembalikan pesan error yang lebih umum ke klien untuk keamanan
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

