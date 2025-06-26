//models/Sekolah.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ISekolah extends Document {
    _id: mongoose.Types.ObjectId; 
    kecamatan_id: mongoose.Types.ObjectId;
    sekolah_maarif: string;
    tanggal_sp: Date; // Diubah dari string menjadi Date
    nomor_sp: string;
}

const SekolahSchema: Schema = new Schema ({
    _id: {type: Schema.Types.ObjectId, required: true}, 
    kecamatan_id: {type: Schema.Types.ObjectId, ref: "Kecamatan", required: true},
    sekolah_maarif: {type: String, required: true},
    tanggal_sp: {type: Date, required: true}, // Diubah dari string menjadi Date
    nomor_sp: {type: String, required: false},
});

export default mongoose.models.Sekolah || mongoose.model<ISekolah>('Sekolah', SekolahSchema, 'database_komisariat');

