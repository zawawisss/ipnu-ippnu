import mongoose, { Document, Schema, SchemaType } from "mongoose";

export interface ISekolah extends Document {
    _id: string;
    kecamatan_id: mongoose.Types.ObjectId;
    sekolah_maarif: string;
    status_sp: string;
    tanggal_sp: string;
}

const SekolahSchema: Schema = new Schema ({
    _id: {type: String, required: true},
    kecamatan_id: {type: Schema.Types.ObjectId, ref: "Kecamatan", required: true},
    sekolah_maarif: {type: String, required: true},
    status_sp: {type: String, required: true},
    tanggal_sp: {type: String, required: true},
});

export default mongoose.models.Sekolah || mongoose.model<ISekolah>('Sekolah', SekolahSchema, 'database_komisariat');