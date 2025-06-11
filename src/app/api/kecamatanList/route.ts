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
                // Use $let to define a variable for the converted end date
                status: {
                    $cond: [
                        { $not: ["$tanggal_berakhir"] },
                        "3", // No date - sort last
                        {
                            $let: {
                                vars: { 
                                    // Convert tanggal_berakhir to a Date object
                                    endDate: { $toDate: "$tanggal_berakhir" } 
                                },
                                in: {
                                    $cond: [
                                        // Compare current date with endDate minus 14 days (in milliseconds)
                                        { $lt: [new Date(), { $subtract: ["$$endDate", 14 * 24 * 60 * 60 * 1000] }] },
                                        "0", // Aktif
                                        {
                                            $cond: [
                                                // Compare current date with endDate
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
        // Return a more generic error message to the client for security
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
