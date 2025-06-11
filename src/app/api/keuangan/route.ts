import { NextRequest, NextResponse } from "next/server";
import Keuangan from "@/models/Keuangan";
import db from "@/lib/db";


// GET: Ambil semua data keuangan
export function GET(req: NextRequest): Promise<NextResponse> {
  return new Promise(async (resolve, reject) => {
    await db();
    try {
      const data = await Keuangan.find().sort({ tanggal: -1 });
      resolve(NextResponse.json(data));
    } catch (error) {
      console.error("Error fetching keuangan data:", error);
      resolve(NextResponse.json({ message: "Error fetching data" }, { status: 500 }));
    }
  });
}

// POST: Tambah data keuangan baru
export function POST(req: NextRequest): Promise<NextResponse> {
  return new Promise(async (resolve, reject) => {
    await db();
    try {
      const body = await req.json();
      body.tanggal = new Date(body.tanggal);
      const item = await Keuangan.create(body);
      resolve(NextResponse.json(item, { status: 201 }));
    } catch (error) {
      console.error("Error saving keuangan data:", error);
      resolve(NextResponse.json({ message: "Error saving data" }, { status: 500 }));
    }
  });
}

// PUT: Update data keuangan berdasarkan _id
export function PUT(req: NextRequest): Promise<NextResponse> {
  return new Promise(async (resolve, reject) => {
    await db();
    try {
      const body = await req.json();
      const { _id, ...update } = body;
      if (!_id) {
        resolve(NextResponse.json({ error: "ID diperlukan" }, { status: 400 }));
        return;
      }
      if (update.tanggal) {
        update.tanggal = new Date(update.tanggal);
      }
      const updated = await Keuangan.findByIdAndUpdate(_id, update, { new: true });
      if (!updated) {
        resolve(NextResponse.json(
          { error: "Data tidak ditemukan" },
          { status: 404 }
        ));
        return;
      }
      resolve(NextResponse.json(updated));
    } catch (error) {
      console.error("Error updating keuangan data:", error);
      resolve(NextResponse.json({ message: "Error updating data" }, { status: 500 }));
    }
  });
}

// DELETE: Hapus data keuangan berdasarkan _id (from query param)
export function DELETE(req: NextRequest): Promise<NextResponse> {
  return new Promise(async (resolve, reject) => {
    await db();
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      if (!id) {
        resolve(NextResponse.json({ error: "ID diperlukan" }, { status: 400 }));
        return;
      }
      const deleted = await Keuangan.findByIdAndDelete(id);
      if (!deleted) {
        resolve(NextResponse.json(
          { error: "Data tidak ditemukan" },
          { status: 404 }
        ));
        return;
      }
      resolve(NextResponse.json({ success: true }));
    } catch (error) {
      console.error("Error deleting keuangan data:", error);
      resolve(NextResponse.json({ message: "Error deleting data" }, { status: 500 }));
    }
  });
}
