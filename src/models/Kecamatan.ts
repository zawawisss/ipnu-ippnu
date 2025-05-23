    //models/Kecamatan.ts
    import mongoose, { Document, Schema } from "mongoose";

    export interface IKecamatan extends Document {
        kecamatan: string;
        status_sp: string;
        tanggal_berakhir: string;
        nomor_sp: string;
        // --- Ubah 'jumlah_anggota' menjadi 'jumlah_desa' ---
        jumlah_desa?: number; // Contoh: opsional, tipe number
        jumlah_ranting?: number; // Contoh: opsional, tipe number
        jumlah_komisariat?: number; // Contoh: opsional, tipe number
        // Jika Anda ingin mereka wajib, ubah menjadi:
        // jumlah_desa: number;
        // jumlah_ranting: number;
        // jumlah_komisariat: number;
    }

    const KecamatanSchema: Schema = new Schema({
        kecamatan: {type: String, required: true},
        status_sp: {type: String, required: true},
        tanggal_berakhir: {type: String, required: true},
        nomor_sp: {type: String, required: true},
        // --- Ubah definisi schema untuk bidang ini ---
        jumlah_desa: {type: Number, default: 0}, // Contoh: default 0 jika tidak diberikan
        jumlah_ranting: {type: Number, default: 0},
        jumlah_komisariat: {type: Number, default: 0},
    });

    export default mongoose.models.Kecamatan || mongoose.model<IKecamatan>('Kecamatan', KecamatanSchema, 'kecamatan');
    