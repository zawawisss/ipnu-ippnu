// src/app/api/desaAdmin/[id]/route.ts
import db from "@/lib/db";
import Desa from "@/models/Desa";
import { NextRequest, NextResponse } from "next/server";
import mongoose from 'mongoose'; // Impor mongoose

// Handler untuk metode GET (mengambil satu desa berdasarkan ID)
// Next.js secara otomatis menyediakan `params` dalam objek kedua.
// Menghilangkan anotasi tipe eksplisit agar TypeScript menginfer tipe yang benar dari Next.js.
export async function GET(
  req: NextRequest,
  // context: { params: { id: string } } // Hapus anotasi tipe ini
  context: any // Biarkan TypeScript menginfer atau gunakan `any` jika perlu untuk sementara
) {
  const { id } = context.params; // Akses id dari context.params

  await db(); // Koneksi ke database

  try {
    // Mencari desa berdasarkan ID dan mengisi data kecamatan
    const desa = await Desa.findById(id).populate('kecamatan_id');
    
    if (!desa) {
      // Jika desa tidak ditemukan, kirim respons 404
      return NextResponse.json(
        { message: "Desa tidak ditemukan." },
        { status: 404 }
      );
    }
    // Jika desa ditemukan, kirim data desa dengan status 200
    return NextResponse.json(desa, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch desa:', error);
    // Tangani kesalahan server internal
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data desa." },
      { status: 500 }
    );
  }
}

// Handler untuk metode PUT (memperbarui satu desa berdasarkan ID)
// Sama seperti GET, menghilangkan anotasi tipe eksplisit untuk `context`.
export async function PUT(
  req: NextRequest,
  // context: { params: { id: string } } // Hapus anotasi tipe ini
  context: any // Biarkan TypeScript menginfer atau gunakan `any` jika perlu untuk sementara
) {
  try {
    const { id } = context.params; // Akses id dari context.params
    const body = await req.json(); // Ambil body dari request

    await db(); // Koneksi ke database

    // --- DEBUGGING LANJUTAN ---
    console.log(`Attempting to update Desa with ID: ${id}`);
    console.log(`Received body for update:`, body);

    // Validasi format ID sebelum mencari
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`DEBUG: Provided ID "${id}" is not a valid MongoDB ObjectId.`);
      return NextResponse.json({ message: "ID Desa tidak valid." }, { status: 400 });
    }

    // Coba temukan dokumen hanya dengan findById dulu
    const existingDesa = await Desa.findById(id);
    console.log("Result of findById before update:", existingDesa);

    if (!existingDesa) {
        console.error(`DEBUG: findById returned null for ID: ${id}. Document might not exist or ID is invalid.`);
        return NextResponse.json({ message: "Desa tidak ditemukan (debug findById)." }, { status: 404 });
    }
    // --- AKHIR DEBUGGING LANJUTAN ---

    const updateData: { [key: string]: any } = {};

    // Membangun objek updateData berdasarkan properti yang ada di body
    if (body.status_sp !== undefined) {
      updateData.status_sp = body.status_sp;
    }
    if (body.tanggal_sp !== undefined) {
      updateData.tanggal_sp = new Date(body.tanggal_sp);
    }
    if (body.nomor_sp !== undefined) {
      updateData.nomor_sp = body.nomor_sp;
    }
    if (body.jumlah_anggota !== undefined) {
      const numAnggota = Number(body.jumlah_anggota);
      if (!isNaN(numAnggota)) {
        updateData.jumlah_anggota = numAnggota;
      } else {
        updateData.jumlah_anggota = 0; // Default ke 0 jika bukan angka
      }
    }

    console.log("updateData payload sent to Mongoose:", updateData); // Log payload yang dikirim ke Mongoose

    // Melakukan pembaruan dokumen
    const updatedDesa = await Desa.findByIdAndUpdate(
      id, // Menggunakan ID yang sama
      updateData, // Data yang akan diperbarui
      { new: true, runValidators: true } // Opsi: kembalikan dokumen yang diperbarui, jalankan validator skema
    );

    if (!updatedDesa) {
      console.error(`DEBUG: findByIdAndUpdate returned null for ID: ${id}. Update operation failed.`);
      return NextResponse.json(
        { message: "Desa tidak ditemukan atau gagal diperbarui (debug findByIdAndUpdate)." },
        { status: 404 }
      );
    }

    // Jika pembaruan berhasil, kirim dokumen yang diperbarui
    return NextResponse.json(updatedDesa, { status: 200 });
  } catch (error: any) {
    console.error("Error updating desa:", error);
    // Tangani kesalahan validasi Mongoose
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: "Validasi gagal.", errors: error.errors },
        { status: 400 }
      );
    }
    // Tangani kesalahan umum server internal
    return NextResponse.json(
      { message: "Gagal memperbarui data desa.", error: error.message },
      { status: 500 }
    );
  }
}
