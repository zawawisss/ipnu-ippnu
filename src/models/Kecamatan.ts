//models/Kecamatan.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IDatabase extends Document {
    kecamatan: string;
    status_sp: string;
    tanggal_berakhir: string;
}

const DatabaseSchema: Schema = new Schema({
    kecamatan: {type: String, required: true},
    status_sp: {type: String, required: true},
    tanggal_berakhir: {type: String, required: true},
});

export default mongoose.models.Database || mongoose.model<IDatabase>('Database', DatabaseSchema, 'database');