//models/Desa.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IDesa extends Document {
    _id: mongoose.Types.ObjectId; // Mengubah tipe _id menjadi ObjectId
    nama_desa: string;
    status_sp: string;
    tanggal_sp: string;
    nomor_sp: string;
    jumlah_anggota: number;
    kecamatan_id: mongoose.Types.ObjectId;
}

const DesaSchema: Schema = new Schema({
    _id: {type: Schema.Types.ObjectId, required: true}, // Mengubah tipe _id di skema
    nama_desa: {type: String, required: true},
    status_sp: {type: String, required: true},
    tanggal_sp: {type: Date, required: true},
    nomor_sp: {type: String, required: true},
    jumlah_anggota: {type: Number, required: true},
    kecamatan_id: {type: Schema.Types.ObjectId, ref: "Kecamatan", required: true},
});

export default mongoose.models.Desa || mongoose.model<IDesa>('Desa', DesaSchema, 'database_ranting');
