// src/app/api/sekolahAdmin/[id]/route.ts
import db from "@/lib/db";
import Sekolah from "@/models/Sekolah"; // Impor model Sekolah
import { NextRequest, NextResponse } from "next/server";
import mongoose from 'mongoose'; // Impor mongoose

// Handler untuk metode GET (mengambil satu sekolah berdasarkan ID)
export async function GET(
  req: NextRequest,
  // Hapus anotasi tipe eksplisit untuk `context`
  context: any // Biarkan TypeScript menginfer atau gunakan `any` jika perlu untuk sementara
) {
  const { id } = context.params; // Akses id dari context.params

  await db();

  try {
    const sekolah = await Sekolah.findById(id).populate('kecamatan_id');
    
    if (!sekolah) {
      return NextResponse.json(
        { message: "Komisariat/Sekolah tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json(sekolah, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch sekolah:', error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data Komisariat/Sekolah." },
      { status: 500 }
    );
  }
}

// Handler untuk metode PUT (memperbarui satu sekolah berdasarkan ID)
export async function PUT(
  req: NextRequest,
  // Hapus anotasi tipe eksplisit untuk `context`
  context: any // Biarkan TypeScript menginfer atau gunakan `any` jika perlu untuk sementara
) {
  try {
    const { id } = context.params; // Akses id dari context.params
    const body = await req.json();

    await db();

    // Pastikan ID valid sebelum melanjutkan
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Provided ID "${id}" is not a valid MongoDB ObjectId.`);
      return NextResponse.json({ message: "ID Komisariat/Sekolah tidak valid." }, { status: 400 });
    }

    const updateData: { [key: string]: any } = {};

    // status_sp tidak lagi diterima dari frontend
    // if (body.status_sp !== undefined) {
    //   updateData.status_sp = body.status_sp;
    // }
    if (body.tanggal_sp !== undefined) {
      updateData.tanggal_sp = body.tanggal_sp; // Tetap string
    }
    if (body.nomor_sp !== undefined) {
      updateData.nomor_sp = body.nomor_sp;
    }

    const updatedSekolah = await Sekolah.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSekolah) {
      return NextResponse.json(
        { message: "Komisariat/Sekolah tidak ditemukan atau gagal diperbarui." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSekolah, { status: 200 });
  } catch (error: any) {
    console.error("Error updating sekolah:", error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: "Validasi gagal.", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Gagal memperbarui data Komisariat/Sekolah.", error: error.message },
      { status: 500 }
    );
  }
}
