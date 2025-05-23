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

// === TAMBAHKAN FUNGSI PUT INI UNTUK UPDATE DATA ===
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // Ambil ID dari URL
  const body = await req.json(); // Ambil data yang dikirim dari frontend

  await db(); // Pastikan koneksi ke database

  try {
    const updatedKecamatan = await Kecamatan.findByIdAndUpdate(
      id, // Cari dokumen berdasarkan ID
      body, // Data baru yang akan diperbarui
      { new: true, runValidators: false } // Opsi: 'new: true' mengembalikan dokumen yang sudah diperbarui; 'runValidators: true' menjalankan validasi schema
    );

    if (!updatedKecamatan) {
      return NextResponse.json(
        { message: "Kecamatan tidak ditemukan atau gagal diperbarui." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedKecamatan, { status: 200 });
  } catch (error: any) {
    console.error("Error updating kecamatan:", error);
    // Tangani error validasi Mongoose atau error lainnya
    return NextResponse.json(
      { message: "Gagal memperbarui data kecamatan.", error: error.message },
      { status: 500 }
    );
  }
}

// === OPSIONAL: TAMBAHKAN FUNGSI DELETE INI UNTUK MENGHAPUS DATA ===
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await db();

  try {
    const deletedKecamatan = await Kecamatan.findByIdAndDelete(id);

    if (!deletedKecamatan) {
      return NextResponse.json(
        { message: "Kecamatan tidak ditemukan atau gagal dihapus." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Kecamatan berhasil dihapus." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting kecamatan:", error);
    return NextResponse.json(
      { message: "Gagal menghapus data kecamatan.", error: error.message },
      { status: 500 }
    );
  }
}