import mongoose, { Document, Schema } from 'mongoose';

export interface IArsipMasuk extends Document {
  no: number;
  nomor_surat: string;
  pengirim: string;
  perihal: string;
  tanggal_surat: string; // Assuming date is stored as a string
}

const ArsipMasukSchema: Schema = new Schema({
  no: { type: Number, required: true },
  nomor_surat: { type: String, required: true },
  pengirim: { type: String, required: true },
  perihal: { type: String, required: true },
  tanggal_surat: { type: String, required: true },
});

const ArsipMasuk = mongoose.models.ArsipMasuk || mongoose.model<IArsipMasuk>('ArsipMasuk', ArsipMasukSchema, 'arsipmasuk');

export default ArsipMasuk;