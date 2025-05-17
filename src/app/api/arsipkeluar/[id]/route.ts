import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ArsipKeluar from "@/models/ArsipKeluar";
import { checkAdminSession } from "@/lib/checkAdminSession";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const allowedRoles = ["admin", "ipnu_admin", "ippnu_admin", "superadmin"];
    const orgPrefix = "ipnu";
    const session = await checkAdminSession(allowedRoles, orgPrefix);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const arsipKeluar = await ArsipKeluar.findById(id);

    if (!arsipKeluar) {
      return NextResponse.json(
        { message: "Arsip Keluar not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(arsipKeluar);
  } catch (error) {
    console.error("Error fetching arsip keluar:", error);
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const allowedRoles = ["admin", "ipnu_admin", "ippnu_admin", "superadmin"];
    const orgPrefix = "ipnu";
    const session = await checkAdminSession(allowedRoles, orgPrefix);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();

    const updatedArsipKeluar = await ArsipKeluar.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedArsipKeluar) {
      return NextResponse.json(
        { message: "Arsip Keluar not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedArsipKeluar);
  } catch (error) {
    console.error("Error updating arsip keluar:", error);
    return NextResponse.json(
      { message: "Error updating data" },
      { status: 500 }
    );
  }
}
