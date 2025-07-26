import mongoose, { Document, Schema } from 'mongoose';

export interface IKaderisasi extends Document {
  nama: string;
  nim?: string;
  komisariat: string;
  kecamatan: string;
  desa: string;
  jenjangKader: 'MAKESTA' | 'LAKMUD' | 'LAKUT' | 'LATIN' | 'LATPEL';
  statusKader: 'Aktif' | 'Tidak Aktif' | 'Alumni';
  tanggalMulai: Date;
  tanggalSelesai?: Date;
  mentor: string;
  materiSelesai: string[];
  nilaiAkhir?: number;
  sertifikat: boolean;
  catatan?: string;
  organization: 'IPNU' | 'IPPNU';
  createdAt: Date;
  updatedAt: Date;
}

const KaderisasiSchema: Schema = new Schema(
  {
    nama: {
      type: String,
      required: [true, 'Nama harus diisi'],
      trim: true
    },
    nim: {
      type: String,
      trim: true
    },
    komisariat: {
      type: String,
      required: [true, 'Komisariat harus diisi'],
      trim: true
    },
    kecamatan: {
      type: String,
      required: [true, 'Kecamatan harus diisi'],
      trim: true
    },
    desa: {
      type: String,
      required: [true, 'Desa harus diisi'],
      trim: true
    },
    jenjangKader: {
      type: String,
      required: [true, 'Jenjang kader harus diisi'],
      enum: ['MAKESTA', 'LAKMUD', 'LAKUT', 'LATIN', 'LATPEL']
    },
    statusKader: {
      type: String,
      required: [true, 'Status kader harus diisi'],
      enum: ['Aktif', 'Tidak Aktif', 'Alumni'],
      default: 'Aktif'
    },
    tanggalMulai: {
      type: Date,
      required: [true, 'Tanggal mulai harus diisi']
    },
    tanggalSelesai: {
      type: Date
    },
    mentor: {
      type: String,
      required: [true, 'Mentor harus diisi'],
      trim: true
    },
    materiSelesai: {
      type: [String],
      default: []
    },
    nilaiAkhir: {
      type: Number,
      min: 0,
      max: 100
    },
    sertifikat: {
      type: Boolean,
      default: false
    },
    catatan: {
      type: String,
      trim: true
    },
    organization: {
      type: String,
      required: [true, 'Organisasi harus diisi'],
      enum: ['IPNU', 'IPPNU']
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
KaderisasiSchema.index({ nama: 'text', komisariat: 'text', nim: 'text' });
KaderisasiSchema.index({ organization: 1, statusKader: 1 });
KaderisasiSchema.index({ jenjangKader: 1, organization: 1 });

const Kaderisasi = mongoose.models.Kaderisasi || mongoose.model<IKaderisasi>('Kaderisasi', KaderisasiSchema);

export default Kaderisasi;
