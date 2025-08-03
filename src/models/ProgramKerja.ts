import mongoose, { Document, Schema } from 'mongoose';

// Interface untuk Program Kerja
export interface IProgramKerja extends Document {
  nama: string;
  deskripsi: string;
  organisasi: 'IPNU' | 'IPPNU' | 'KOORDINATIF';
  unit_type: 'DEPARTEMEN' | 'LEMBAGA' | 'BADAN';
  unit_name: string;
  unit_id: string; // departemen_organisasi, lembaga_cbp, etc.

  // Timeline
  tanggal_mulai: Date;
  tanggal_selesai: Date;
  status: 'PERENCANAAN' | 'BERJALAN' | 'SELESAI' | 'TERTUNDA' | 'DIBATALKAN';

  // Target & Metrics
  target_peserta: number;
  realisasi_peserta: number;
  anggaran: {
    disetujui: number;
    terpakai: number;
  };

  // Progress
  progress_percentage: number;
  milestone: {
    nama: string;
    tanggal_target: Date;
    status: 'PENDING' | 'COMPLETED' | 'DELAYED';
    keterangan?: string;
  }[];

  // Koordinasi dan Pengawalan
  koordinasi: {
    is_koordinatif: boolean;
    unit_terkait: string[];
    level_koordinasi: 'internal' | 'eksternal' | 'koordinatif';
    pic_koordinasi: string[];
    tingkat_pelaksana: 'PC' | 'PAC' | 'PR' | 'PK' | 'Komisariat';
    pengawalan_tingkat: {
      level: 'PC' | 'PAC' | 'PR' | 'PK';
      pengawal: string;
      jadwal_pengawalan: Date[];
      status_pengawalan: 'belum' | 'proses' | 'selesai';
    }[];
  };

  // Supervisi
  supervisi: {
    require_supervisi: boolean;
    level_supervisi: ('PC' | 'PAC' | 'PR' | 'PK')[];
    jadwal_supervisi: {
      tanggal: Date;
      level: string;
      supervisor: string;
      agenda: string;
      status: 'scheduled' | 'completed' | 'cancelled';
    }[];
    laporan_supervisi: {
      tanggal: Date;
      supervisor: string;
      level: string;
      temuan: string;
      rekomendasi: string;
      tindak_lanjut: string;
      dokumen: string[];
    }[];
  };

  // Metadata
  penanggung_jawab: string;
  koordinator: string;
  lokasi?: string;
  tingkat: 'PP' | 'PW' | 'PC' | 'PAC' | 'PK' | 'PR';

  createdAt: Date;
  updatedAt: Date;
}

// Schema Program Kerja
const ProgramKerjaSchema: Schema = new Schema(
  {
    nama: { type: String, required: true },
    deskripsi: { type: String, required: true },
    organisasi: {
      type: String,
      enum: ['IPNU', 'IPPNU', 'KOORDINATIF'],
      required: true,
    },
    unit_type: {
      type: String,
      enum: ['DEPARTEMEN', 'LEMBAGA', 'BADAN'],
      required: true,
    },
    unit_name: { type: String, required: true },
    unit_id: { type: String, required: true },

    tanggal_mulai: { type: Date, required: true },
    tanggal_selesai: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PERENCANAAN', 'BERJALAN', 'SELESAI', 'TERTUNDA', 'DIBATALKAN'],
      default: 'PERENCANAAN',
    },

    target_peserta: { type: Number, default: 0 },
    realisasi_peserta: { type: Number, default: 0 },
    anggaran: {
      disetujui: { type: Number, required: true },
      terpakai: { type: Number, default: 0 },
    },

    progress_percentage: { type: Number, min: 0, max: 100, default: 0 },
    milestone: [
      {
        nama: { type: String, required: true },
        tanggal_target: { type: Date, required: true },
        status: {
          type: String,
          enum: ['PENDING', 'COMPLETED', 'DELAYED'],
          default: 'PENDING',
        },
        keterangan: { type: String },
      },
    ],

    koordinasi: {
      is_koordinatif: { type: Boolean, default: false },
      unit_terkait: [String],
      level_koordinasi: {
        type: String,
        enum: ['internal', 'eksternal', 'koordinatif'],
        default: 'internal',
      },
      pic_koordinasi: [String],
      tingkat_pelaksana: {
        type: String,
        enum: ['PC', 'PAC', 'PR', 'PK', 'Komisariat'],
        required: true,
      },
      pengawalan_tingkat: [
        {
          level: {
            type: String,
            enum: ['PC', 'PAC', 'PR', 'PK'],
            required: true,
          },
          pengawal: { type: String, required: true },
          jadwal_pengawalan: [Date],
          status_pengawalan: {
            type: String,
            enum: ['belum', 'proses', 'selesai'],
            default: 'belum',
          },
        },
      ],
    },

    supervisi: {
      require_supervisi: { type: Boolean, default: false },
      level_supervisi: [
        {
          type: String,
          enum: ['PC', 'PAC', 'PR', 'PK'],
        },
      ],
      jadwal_supervisi: [
        {
          tanggal: { type: Date, required: true },
          level: { type: String, required: true },
          supervisor: { type: String, required: true },
          agenda: { type: String, required: true },
          status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled'],
            default: 'scheduled',
          },
        },
      ],
      laporan_supervisi: [
        {
          tanggal: { type: Date, required: true },
          supervisor: { type: String, required: true },
          level: { type: String, required: true },
          temuan: { type: String, required: true },
          rekomendasi: { type: String, required: true },
          tindak_lanjut: { type: String, required: true },
          dokumen: [String],
        },
      ],
    },

    penanggung_jawab: { type: String, required: true },
    koordinator: { type: String, required: true },
    lokasi: { type: String },
    tingkat: {
      type: String,
      enum: ['PP', 'PW', 'PC', 'PAC', 'PK', 'PR'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk optimasi query
ProgramKerjaSchema.index({ organisasi: 1, unit_type: 1, unit_id: 1 });
ProgramKerjaSchema.index({ status: 1, tanggal_selesai: 1 });
ProgramKerjaSchema.index({ tingkat: 1, organisasi: 1 });

const ProgramKerja =
  mongoose.models.ProgramKerja ||
  mongoose.model<IProgramKerja>('ProgramKerja', ProgramKerjaSchema);

export default ProgramKerja;
