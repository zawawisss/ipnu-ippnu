import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ArsipKeluar from "@/models/ArsipKeluar";
import { checkAdminSession } from "@/lib/checkAdminSession";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await checkAdminSession();
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await checkAdminSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await checkAdminSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const deletedArsipKeluar = await ArsipKeluar.findByIdAndDelete(id);

    if (!deletedArsipKeluar) {
      return NextResponse.json(
        { message: "Arsip Keluar not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Arsip Keluar deleted successfully" });
  } catch (error) {
    console.error("Error deleting arsip keluar:", error);
    return NextResponse.json(
      { message: "Error deleting data" },
      { status: 500 }
    );
  }
}