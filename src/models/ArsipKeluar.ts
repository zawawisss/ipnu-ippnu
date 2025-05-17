import mongoose, { Document, Schema } from 'mongoose';

export interface IArsipKeluar extends Document {
  no: number;
  indeks: string;
  nomor_surat: string;
  tujuan: string;
  perihal: string;
}

const ArsipKeluarSchema: Schema = new Schema({
  no: { type: Number, required: true },
  indeks: { type: String, required: true },
  nomor_surat: { type: String, required: true },
  tujuan: { type: String, required: true },
  perihal: { type: String, required: true },
});

const ArsipKeluar = mongoose.models.ArsipKeluar || mongoose.model<IArsipKeluar>('ArsipKeluar', ArsipKeluarSchema, 'arsipkeluar');

export default ArsipKeluar;