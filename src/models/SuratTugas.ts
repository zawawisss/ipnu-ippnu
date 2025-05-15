import mongoose, { Document, Schema } from "mongoose";

interface IAssignee {
  nama: string;
  tempatTanggalLahir: string;
  jabatan: string;
  alamat: string;
}

export interface ISuratTugas extends Document {
  assignees: IAssignee[];
  kegiatan: string;
  penyelenggara: string;
  tempat: string;
  tanggalKegiatan: string;
  status: 'pending' | 'approved_ketua' | 'approved_sekretaris' | 'approved_all';
  approvedByKetua?: mongoose.Types.ObjectId;
  approvedBySekretaris?: mongoose.Types.ObjectId;
  approvalKetuaAt?: Date;
  approvalSekretarisAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssigneeSchema: Schema = new Schema({
  nama: { type: String, required: true },
  tempatTanggalLahir: { type: String, required: true },
  jabatan: { type: String, required: true },
  alamat: { type: String, required: true },
});

const SuratTugasSchema: Schema = new Schema({
  assignees: [AssigneeSchema],
  kegiatan: { type: String, required: true },
  penyelenggara: { type: String, required: true },
  tempat: { type: String, required: true },
  tanggalKegiatan: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved_ketua', 'approved_sekretaris', 'approved_all'], default: 'pending' },
  approvedByKetua: { type: mongoose.Types.ObjectId, ref: 'Admin' },
  approvedBySekretaris: { type: mongoose.Types.ObjectId, ref: 'Admin' },
  approvalKetuaAt: { type: Date },
  approvalSekretarisAt: { type: Date },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'Admin', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SuratTugas || mongoose.model<ISuratTugas>('SuratTugas', SuratTugasSchema);
