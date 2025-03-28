import db from "@/lib/db";
import Kecamatan from "@/models/Kecamatan";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
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
