import db from "@/lib/db";
import Kecamatan from "@/models/Kecamatan";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await db();

  try {
    const data = await Kecamatan.findById(id);
    if (!data) {
      return NextResponse.json(
        { message: "Data tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const body = await req.json();

  await db();

  try {
    const updatedKecamatan = await Kecamatan.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: false,
    });

    if (!updatedKecamatan) {
      return NextResponse.json(
        { message: "Kecamatan tidak ditemukan atau gagal diperbarui." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedKecamatan, { status: 200 });
  } catch (error: any) {
    console.error("Error updating kecamatan:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui data kecamatan.", error: error.message },
      { status: 500 }
    );
  }
}

