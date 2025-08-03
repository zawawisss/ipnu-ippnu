import mongoose, { Schema, Document } from 'mongoose';

// Interface untuk Laporan Acara
export interface ILaporanAcara extends Document {
  // Identitas Organisasi
  organisasi: 'IPNU' | 'IPPNU';
  tingkat: 'PC' | 'PAC' | 'PR' | 'PK'; // Pimpinan Cabang, Anak Cabang, Ranting, Komisariat
  namaUnit: string; // Nama PC/PAC/PR/PK
  departemen: string; // Departemen/Lembaga penyelenggara

  // Detail Acara
  namaAcara: string;
  jenisAcara:
    | 'Rutin'
    | 'Insidental'
    | 'Program Kerja'
    | 'Koordinasi'
    | 'Pelatihan'
    | 'Seminar'
    | 'Workshop'
    | 'Bakti Sosial'
    | 'Olahraga'
    | 'Kesenian'
    | 'Keagamaan'
    | 'Lainnya';
  tempatAcara: {
    nama: string;
    alamat: string;
    kota: string;
  };
  waktuPelaksanaan: {
    tanggalMulai: Date;
    tanggalSelesai: Date;
    jamMulai: string;
    jamSelesai: string;
  };

  // Penyelenggara dan Penanggung Jawab
  penanggungJawab: {
    nama: string;
    jabatan: string;
    kontak: string;
  };
  panitia: Array<{
    nama: string;
    jabatan: string;
    bagian: string;
  }>;

  // Peserta
  peserta: {
    targetPeserta: number;
    jumlahHadir: number;
    kategoriPeserta: string[]; // ['Pengurus', 'Anggota', 'Umum', 'Undangan']
    daftarPeserta?: string; // Link/file daftar peserta
  };

  // Agenda dan Materi
  agenda: Array<{
    waktu: string;
    kegiatan: string;
    pemateri?: string;
    keterangan?: string;
  }>;

  // Anggaran dan Keuangan
  anggaran: {
    sumberDana: string[]; // ['Kas Organisasi', 'Iuran', 'Sponsor', 'Hibah', 'Lainnya']
    totalAnggaran: number;
    realisasiAnggaran: number;
    rincianBiaya: Array<{
      item: string;
      rencana: number;
      realisasi: number;
      keterangan?: string;
    }>;
  };

  // Koordinasi
  koordinasi: {
    internal: string[]; // Unit internal yang dikoordinasikan
    eksternal: Array<{
      instansi: string;
      jenisDukungan: string;
      kontakPerson: string;
    }>;
  };

  // Hasil dan Capaian
  hasil: {
    tingkatKehadiran: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
    antusiasme: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah';
    pencapaianTujuan:
      | 'Tercapai Sepenuhnya'
      | 'Sebagian Besar Tercapai'
      | 'Tercapai Sebagian'
      | 'Belum Tercapai';
    outputKuantitatif: Array<{
      indikator: string;
      target: string;
      capaian: string;
    }>;
    outputKualitatif: string;
  };

  // Kendala dan Solusi
  kendala: Array<{
    masalah: string;
    dampak: string;
    solusi: string;
    status: 'Teratasi' | 'Dalam Proses' | 'Belum Teratasi';
  }>;

  // Dokumentasi
  dokumentasi: {
    foto: string[]; // Array URL foto
    video?: string; // URL video
    materi?: string; // URL file materi
    sertifikat?: string; // URL sertifikat
    mediaCoverage?: Array<{
      media: string;
      link: string;
      tanggal: Date;
    }>;
  };

  // Evaluasi dan Rekomendasi
  evaluasi: {
    aspekPositif: string[];
    aspekNegatif: string[];
    lessons_learned: string;
    rekomendasi: string[];
    saran: string;
  };

  // Tindak Lanjut
  tindakLanjut: {
    rencanaKegiatan: Array<{
      kegiatan: string;
      targetWaktu: Date;
      penanggungJawab: string;
    }>;
    komitmen: string;
  };

  // Validasi dan Persetujuan
  validasi: {
    disusunOleh: {
      nama: string;
      jabatan: string;
      tanggal: Date;
      ttd?: string; // URL tanda tangan digital
    };
    disetujuiOleh: {
      nama: string;
      jabatan: string;
      tanggal?: Date;
      ttd?: string;
      catatan?: string;
    };
    status:
      | 'Draft'
      | 'Menunggu Persetujuan'
      | 'Disetujui'
      | 'Perlu Revisi'
      | 'Ditolak';
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  lastModifiedBy: string; // User ID
  version: number;
  tags: string[]; // Tag untuk kategorisasi
}

// Schema Mongoose
const LaporanAcaraSchema = new Schema<ILaporanAcara>(
  {
    organisasi: {
      type: String,
      enum: ['IPNU', 'IPPNU'],
      required: true,
    },
    tingkat: {
      type: String,
      enum: ['PC', 'PAC', 'PR', 'PK'],
      required: true,
    },
    namaUnit: {
      type: String,
      required: true,
    },
    departemen: {
      type: String,
      required: true,
    },

    namaAcara: {
      type: String,
      required: true,
    },
    jenisAcara: {
      type: String,
      enum: [
        'Rutin',
        'Insidental',
        'Program Kerja',
        'Koordinasi',
        'Pelatihan',
        'Seminar',
        'Workshop',
        'Bakti Sosial',
        'Olahraga',
        'Kesenian',
        'Keagamaan',
        'Lainnya',
      ],
      required: true,
    },
    tempatAcara: {
      nama: { type: String, required: true },
      alamat: { type: String, required: true },
      kota: { type: String, required: true },
    },
    waktuPelaksanaan: {
      tanggalMulai: { type: Date, required: true },
      tanggalSelesai: { type: Date, required: true },
      jamMulai: { type: String, required: true },
      jamSelesai: { type: String, required: true },
    },

    penanggungJawab: {
      nama: { type: String, required: true },
      jabatan: { type: String, required: true },
      kontak: { type: String, required: true },
    },
    panitia: [
      {
        nama: { type: String, required: true },
        jabatan: { type: String, required: true },
        bagian: { type: String, required: true },
      },
    ],

    peserta: {
      targetPeserta: { type: Number, required: true },
      jumlahHadir: { type: Number, required: true },
      kategoriPeserta: [{ type: String }],
      daftarPeserta: { type: String },
    },

    agenda: [
      {
        waktu: { type: String, required: true },
        kegiatan: { type: String, required: true },
        pemateri: { type: String },
        keterangan: { type: String },
      },
    ],

    anggaran: {
      sumberDana: [{ type: String }],
      totalAnggaran: { type: Number, required: true },
      realisasiAnggaran: { type: Number, required: true },
      rincianBiaya: [
        {
          item: { type: String, required: true },
          rencana: { type: Number, required: true },
          realisasi: { type: Number, required: true },
          keterangan: { type: String },
        },
      ],
    },

    koordinasi: {
      internal: [{ type: String }],
      eksternal: [
        {
          instansi: { type: String, required: true },
          jenisDukungan: { type: String, required: true },
          kontakPerson: { type: String, required: true },
        },
      ],
    },

    hasil: {
      tingkatKehadiran: {
        type: String,
        enum: ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'],
        required: true,
      },
      antusiasme: {
        type: String,
        enum: ['Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah'],
        required: true,
      },
      pencapaianTujuan: {
        type: String,
        enum: [
          'Tercapai Sepenuhnya',
          'Sebagian Besar Tercapai',
          'Tercapai Sebagian',
          'Belum Tercapai',
        ],
        required: true,
      },
      outputKuantitatif: [
        {
          indikator: { type: String, required: true },
          target: { type: String, required: true },
          capaian: { type: String, required: true },
        },
      ],
      outputKualitatif: { type: String, required: true },
    },

    kendala: [
      {
        masalah: { type: String, required: true },
        dampak: { type: String, required: true },
        solusi: { type: String, required: true },
        status: {
          type: String,
          enum: ['Teratasi', 'Dalam Proses', 'Belum Teratasi'],
          required: true,
        },
      },
    ],

    dokumentasi: {
      foto: [{ type: String }],
      video: { type: String },
      materi: { type: String },
      sertifikat: { type: String },
      mediaCoverage: [
        {
          media: { type: String, required: true },
          link: { type: String, required: true },
          tanggal: { type: Date, required: true },
        },
      ],
    },

    evaluasi: {
      aspekPositif: [{ type: String }],
      aspekNegatif: [{ type: String }],
      lessons_learned: { type: String, required: true },
      rekomendasi: [{ type: String }],
      saran: { type: String, required: true },
    },

    tindakLanjut: {
      rencanaKegiatan: [
        {
          kegiatan: { type: String, required: true },
          targetWaktu: { type: Date, required: true },
          penanggungJawab: { type: String, required: true },
        },
      ],
      komitmen: { type: String, required: true },
    },

    validasi: {
      disusunOleh: {
        nama: { type: String, required: true },
        jabatan: { type: String, required: true },
        tanggal: { type: Date, required: true },
        ttd: { type: String },
      },
      disetujuiOleh: {
        nama: { type: String, required: true },
        jabatan: { type: String, required: true },
        tanggal: { type: Date },
        ttd: { type: String },
        catatan: { type: String },
      },
      status: {
        type: String,
        enum: [
          'Draft',
          'Menunggu Persetujuan',
          'Disetujui',
          'Perlu Revisi',
          'Ditolak',
        ],
        default: 'Draft',
      },
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    lastModifiedBy: { type: String, required: true },
    version: { type: Number, default: 1 },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Indexes untuk performa query
LaporanAcaraSchema.index({ organisasi: 1, tingkat: 1, namaUnit: 1 });
LaporanAcaraSchema.index({ 'waktuPelaksanaan.tanggalMulai': -1 });
LaporanAcaraSchema.index({ jenisAcara: 1 });
LaporanAcaraSchema.index({ 'validasi.status': 1 });
LaporanAcaraSchema.index({ departemen: 1 });
LaporanAcaraSchema.index({ tags: 1 });

// Middleware untuk update timestamp
LaporanAcaraSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual untuk durasi acara
LaporanAcaraSchema.virtual('durasiAcara').get(function () {
  const mulai = new Date(this.waktuPelaksanaan.tanggalMulai);
  const selesai = new Date(this.waktuPelaksanaan.tanggalSelesai);
  const diffTime = Math.abs(selesai.getTime() - mulai.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual untuk tingkat keberhasilan
LaporanAcaraSchema.virtual('tingkatKeberhasilan').get(function () {
  const kehadiran =
    (this.peserta.jumlahHadir / this.peserta.targetPeserta) * 100;
  const efisiensiAnggaran =
    ((this.anggaran.totalAnggaran - this.anggaran.realisasiAnggaran) /
      this.anggaran.totalAnggaran) *
    100;

  let skor = 0;

  // Skor kehadiran (40%)
  if (kehadiran >= 90) skor += 40;
  else if (kehadiran >= 75) skor += 30;
  else if (kehadiran >= 60) skor += 20;
  else skor += 10;

  // Skor pencapaian tujuan (40%)
  switch (this.hasil.pencapaianTujuan) {
    case 'Tercapai Sepenuhnya':
      skor += 40;
      break;
    case 'Sebagian Besar Tercapai':
      skor += 30;
      break;
    case 'Tercapai Sebagian':
      skor += 20;
      break;
    default:
      skor += 10;
      break;
  }

  // Skor efisiensi anggaran (20%)
  if (efisiensiAnggaran >= 0 && efisiensiAnggaran <= 10) skor += 20;
  else if (efisiensiAnggaran <= 20) skor += 15;
  else if (efisiensiAnggaran <= 30) skor += 10;
  else skor += 5;

  return skor;
});

export default mongoose.models.LaporanAcara ||
  mongoose.model<ILaporanAcara>('LaporanAcara', LaporanAcaraSchema);
