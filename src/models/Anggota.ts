import mongoose, { Document, Schema } from 'mongoose';

export interface IAnggota extends Document {
  _id: string;
  nama_anggota: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  pendidikan: string;
  jabatan: string;
  pengkaderan: string;
  kecamatan_id: mongoose.Types.ObjectId;
}

const AnggotaSchema: Schema = new Schema({
  _id: { type: String, required: true },
  nama_anggota: { type: String, required: true },
  tempat_lahir: { type: String, required: true },
  tanggal_lahir: { type: String, required: true },
  alamat: { type: String, required: true },
  pendidikan: { type: String, required: true },
  jabatan: { type: String, required: true },
  pengkaderan: { type: String, required: true },
  kecamatan_id: {
    type: Schema.Types.ObjectId,
    ref: 'Kecamatan',
    required: true,
  },
});

export default mongoose.models.Anggota ||
  mongoose.model<IAnggota>('Anggota', AnggotaSchema, 'data_anggota');
