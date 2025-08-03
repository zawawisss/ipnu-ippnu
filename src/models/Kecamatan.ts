//app/models/Kecamatan.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IKecamatan extends Document {
  kecamatan: string;
  tanggal_sp: Date; // Mengubah tipe dari string menjadi Date
  nomor_sp: string;
  jumlah_desa?: number;
  jumlah_ranting?: number;
  jumlah_komisariat?: number;
}

const KecamatanSchema: Schema = new Schema({
  kecamatan: { type: String, required: true },
  tanggal_sp: { type: Date, required: true }, // Mengubah tipe di skema dari string menjadi Date
  nomor_sp: { type: String, required: false },
  jumlah_desa: { type: Number, default: 0 },
  jumlah_ranting: { type: Number, default: 0 },
  jumlah_komisariat: { type: Number, default: 0 },
});

export default mongoose.models.Kecamatan ||
  mongoose.model<IKecamatan>('Kecamatan', KecamatanSchema, 'kecamatan');
