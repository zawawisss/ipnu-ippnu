import { NextRequest, NextResponse } from "next/server";
import Keuangan from "@/models/Keuangan";
import db from "@/lib/db";

// GET: Ambil semua data keuangan
export async function GET(req: NextRequest) {
  await db();
  const data = await Keuangan.find().sort({ tanggal: -1 });
  return NextResponse.json(data);
}

// POST: Tambah data keuangan baru
export async function POST(req: NextRequest) {
  await db();
  const body = await req.json();
  // Pastikan tanggal adalah objek Date yang valid
  body.tanggal = new Date(body.tanggal);
  const item = await Keuangan.create(body);
  return NextResponse.json(item, { status: 201 });
}

// PUT: Update data keuangan berdasarkan _id
export async function PUT(req: NextRequest) {
  await db();
  const body = await req.json();
  const { _id, ...update } = body;
  if (!_id) {
    return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
  }
  // Pastikan tanggal adalah objek Date yang valid jika ada di update
  if (update.tanggal) {
    update.tanggal = new Date(update.tanggal);
  }
  const updated = await Keuangan.findByIdAndUpdate(_id, update, { new: true });
  if (!updated) {
    return NextResponse.json(
      { error: "Data tidak ditemukan" },
      { status: 404 }
    );
  }
  return NextResponse.json(updated);
}

// DELETE: Hapus data keuangan berdasarkan _id (dari query param)
export async function DELETE(req: NextRequest) {
  await db();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
  }
  const deleted = await Keuangan.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json(
      { error: "Data tidak ditemukan" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true });
}