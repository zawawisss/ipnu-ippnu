import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Desa from '@/models/Desa';
// import { checkAdminSessionServer } from "@/lib/checkAdminSession";

/**
 * Handler GET untuk mengambil data desa berdasarkan ID.
 * @param request Objek NextRequest.
 * @param context Objek konteks yang berisi parameter dinamis (id).
 * @returns NextResponse dengan data desa atau pesan error.
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } } // Mengubah tipe parameter 'context'
) {
  // Pengecekan sesi admin jika diperlukan.
  // const session = await checkAdminSessionServer(["admin", "ketua", "sekretaris"], "ipnu_");
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  await dbConnect(); // Menghubungkan ke database.
  try {
    // Akses id langsung dari context.params karena Next.js menangani promise secara internal untuk params.
    const { id } = context.params; 
    const desa = await Desa.findById(id); // Mencari desa berdasarkan ID.

    // Jika desa tidak ditemukan, kembalikan response 404.
    if (!desa) {
      return NextResponse.json({ message: 'Desa tidak ditemukan' }, { status: 404 });
    }

    // Mengembalikan data desa jika berhasil.
    return NextResponse.json({ data: desa });
  } catch (error) {
    console.error('Gagal mengambil data desa:', error);
    return NextResponse.json({ error: 'Gagal mengambil data desa' }, { status: 500 });
  }
}

/**
 * Handler PUT untuk memperbarui data desa berdasarkan ID.
 * @param request Objek NextRequest berisi data yang akan diperbarui.
 * @param context Objek konteks yang berisi parameter dinamis (id).
 * @returns NextResponse dengan data desa yang diperbarui atau pesan error.
 */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } } // Mengubah tipe parameter 'context'
) {
  // Pengecekan sesi admin jika diperlukan.
  // const session = await checkAdminSessionServer(["admin", "ketua", "sekretaris"], "ipnu_");
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  await dbConnect(); // Menghubungkan ke database.
  try {
    // Akses id langsung dari context.params.
    const { id } = context.params; 
    const body = await request.json(); // Mengambil body request.
    const updatedDesa = await Desa.findByIdAndUpdate(id, body, { new: true }); // Mencari dan memperbarui desa.

    // Jika desa tidak ditemukan, kembalikan response 404.
    if (!updatedDesa) {
      return NextResponse.json({ message: 'Desa tidak ditemukan' }, { status: 404 });
    }

    // Mengembalikan data desa yang diperbarui jika berhasil.
    return NextResponse.json({ message: 'Desa berhasil diperbarui', data: updatedDesa });
  } catch (error) {
    console.error('Gagal memperbarui data desa:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data desa' }, { status: 500 });
  }
}

/**
 * Handler DELETE untuk menghapus data desa berdasarkan ID.
 * @param request Objek NextRequest.
 * @param context Objek konteks yang berisi parameter dinamis (id).
 * @returns NextResponse dengan pesan sukses atau pesan error.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } // Mengubah tipe parameter 'context'
) {
  // Pengecekan sesi admin jika diperlukan.
  // const session = await checkAdminSessionServer(["admin", "ketua", "sekretaris"], "ipnu_");
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  await dbConnect(); // Menghubungkan ke database.
  try {
    // Akses id langsung dari context.params.
    const { id } = context.params; 
    const deletedDesa = await Desa.findByIdAndDelete(id); // Menghapus desa berdasarkan ID.

    // Jika desa tidak ditemukan, kembalikan response 404.
    if (!deletedDesa) {
      return NextResponse.json({ message: 'Desa tidak ditemukan' }, { status: 404 });
    }

    // Mengembalikan pesan sukses jika berhasil dihapus.
    return NextResponse.json({ message: 'Desa berhasil dihapus' });
  } catch (error) {
    console.error('Gagal menghapus data desa:', error);
    return NextResponse.json({ error: 'Gagal menghapus data desa' }, { status: 500 });
  }
}
