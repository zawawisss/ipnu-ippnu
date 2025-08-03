import mongoose, { Schema, Document } from 'mongoose';

// Interface untuk Progres Laporan Acara
export interface IProgresLaporanAcara extends Document {
  // Informasi Dasar Acara
  namaAcara: string;
  departemen: string;
  penanggungJawab: {
    nama: string;
    jabatan: string;
    kontak: string;
  };
  
  // Waktu dan Tempat (dapat diupdate)
  jadwalAcara: {
    tanggalMulai: Date;
    tanggalSelesai: Date;
    jamMulai: string;
    jamSelesai: string;
    tempatAcara: {
      nama: string;
      alamat: string;
      kota: string;
    };
  };

  // Status Overall Acara (Simple 4-stage flow)
  statusAcara: 'Draft' | 'Persiapan' | 'Pelaksanaan' | 'Selesai' | 'Dibatalkan';
  
  // Daftar Kebutuhan Acara (dinamis)
  daftarKebutuhan: Array<{
    id: string;
    kategori: 'Konsumsi' | 'Tempat' | 'Peralatan' | 'Transportasi' | 'Akomodasi' | 'Lainnya';
    item: string;
    kuantitas: number;
    satuan: string;
    estimasiBiaya: number;
    prioritas: 'Tinggi' | 'Sedang' | 'Rendah';
    status: 'Belum' | 'Proses' | 'Selesai';
    pic: string; // Person in Charge
    catatan?: string;
    tanggalDeadline?: Date;
    tanggalSelesai?: Date;
  }>;

  // Status Koordinasi
  koordinasi: Array<{
    id: string;
    pihak: string;
    jenisKoordinasi: 'Internal' | 'Eksternal';
    topik: string;
    kontakPerson: string;
    status: 'Belum Dimulai' | 'Dalam Proses' | 'Selesai' | 'Tertunda';
    tanggalKoordinasi?: Date;
    hasilKoordinasi?: string;
    tindakLanjut?: string;
    pic: string;
  }>;

  // Checklist Tugas Panitia
  tugasPanitia: Array<{
    id: string;
    namaAnggota: string;
    jabatan: string;
    tugasUtama: string;
    daftarTugas: Array<{
      id: string;
      tugas: string;
      deadline: Date;
      prioritas: 'Tinggi' | 'Sedang' | 'Rendah';
      status: 'Belum Mulai' | 'Dalam Progres' | 'Selesai' | 'Terlambat';
      catatan?: string;
      tanggalSelesai?: Date;
    }>;
    kontribusi?: string;
  }>;

  // Anggaran dan Keuangan (tracking)
  anggaranProgres: {
    totalAnggaranRencana: number;
    totalRealisasi: number;
    rincianBiaya: Array<{
      id: string;
      kategori: string;
      item: string;
      anggaranRencana: number;
      realisasi: number;
      tanggalBayar?: Date;
      buktiPembayaran?: string;
      status: 'Belum Bayar' | 'Sudah Bayar' | 'Pending';
      catatan?: string;
    }>;
  };

  // Timeline Acara
  timeline: Array<{
    id: string;
    waktu: Date;
    kegiatan: string;
    status: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai' | 'Dibatalkan';
    pic: string;
    catatan?: string;
  }>;

  // Catatan Progres
  catatanProgres: Array<{
    id: string;
    tanggal: Date;
    oleh: string;
    kategori: 'Info' | 'Masalah' | 'Solusi' | 'Update';
    isi: string;
    tindakLanjut?: string;
    statusTindakLanjut?: 'Belum' | 'Proses' | 'Selesai';
  }>;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  version: number;
}

// Schema Mongoose
const ProgresLaporanAcaraSchema = new Schema<IProgresLaporanAcara>(
  {
    namaAcara: {
      type: String,
      required: true,
      trim: true,
    },
    departemen: {
      type: String,
      required: true,
      trim: true,
    },
    penanggungJawab: {
      nama: { type: String, required: true, trim: true },
      jabatan: { type: String, required: true, trim: true },
      kontak: { type: String, required: true, trim: true },
    },

    jadwalAcara: {
      tanggalMulai: { type: Date, required: true },
      tanggalSelesai: { type: Date, required: true },
      jamMulai: { type: String, required: true },
      jamSelesai: { type: String, required: true },
      tempatAcara: {
        nama: { type: String, required: true, trim: true },
        alamat: { type: String, required: true, trim: true },
        kota: { type: String, required: true, trim: true },
      },
    },

    statusAcara: {
      type: String,
      enum: ['Draft', 'Persiapan', 'Pelaksanaan', 'Selesai', 'Dibatalkan'],
      default: 'Draft',
    },

    daftarKebutuhan: [
      {
        id: { type: String, required: true },
        kategori: {
          type: String,
          enum: ['Konsumsi', 'Tempat', 'Peralatan', 'Transportasi', 'Akomodasi', 'Lainnya'],
          required: true,
        },
        item: { type: String, required: true, trim: true },
        kuantitas: { type: Number, required: true, min: 0 },
        satuan: { type: String, required: true, trim: true },
        estimasiBiaya: { type: Number, required: true, min: 0 },
        prioritas: {
          type: String,
          enum: ['Tinggi', 'Sedang', 'Rendah'],
          required: true,
        },
        status: {
          type: String,
          enum: ['Belum', 'Proses', 'Selesai'],
          default: 'Belum',
        },
        pic: { type: String, required: true, trim: true },
        catatan: { type: String, trim: true },
        tanggalDeadline: { type: Date },
        tanggalSelesai: { type: Date },
      },
    ],

    koordinasi: [
      {
        id: { type: String, required: true },
        pihak: { type: String, required: true, trim: true },
        jenisKoordinasi: {
          type: String,
          enum: ['Internal', 'Eksternal'],
          required: true,
        },
        topik: { type: String, required: true, trim: true },
        kontakPerson: { type: String, required: true, trim: true },
        status: {
          type: String,
          enum: ['Belum Dimulai', 'Dalam Proses', 'Selesai', 'Tertunda'],
          default: 'Belum Dimulai',
        },
        tanggalKoordinasi: { type: Date },
        hasilKoordinasi: { type: String, trim: true },
        tindakLanjut: { type: String, trim: true },
        pic: { type: String, required: true, trim: true },
      },
    ],

    tugasPanitia: [
      {
        id: { type: String, required: true },
        namaAnggota: { type: String, required: true, trim: true },
        jabatan: { type: String, required: true, trim: true },
        tugasUtama: { type: String, required: true, trim: true },
        daftarTugas: [
          {
            id: { type: String, required: true },
            tugas: { type: String, required: true, trim: true },
            deadline: { type: Date, required: true },
            prioritas: {
              type: String,
              enum: ['Tinggi', 'Sedang', 'Rendah'],
              required: true,
            },
            status: {
              type: String,
              enum: ['Belum Mulai', 'Dalam Progres', 'Selesai', 'Terlambat'],
              default: 'Belum Mulai',
            },
            catatan: { type: String, trim: true },
            tanggalSelesai: { type: Date },
          },
        ],
        kontribusi: { type: String, trim: true },
      },
    ],

    anggaranProgres: {
      totalAnggaranRencana: { type: Number, required: true, min: 0, default: 0 },
      totalRealisasi: { type: Number, required: true, min: 0, default: 0 },
      rincianBiaya: [
        {
          id: { type: String, required: true },
          kategori: { type: String, required: true, trim: true },
          item: { type: String, required: true, trim: true },
          anggaranRencana: { type: Number, required: true, min: 0 },
          realisasi: { type: Number, required: true, min: 0, default: 0 },
          tanggalBayar: { type: Date },
          buktiPembayaran: { type: String, trim: true },
          status: {
            type: String,
            enum: ['Belum Bayar', 'Sudah Bayar', 'Pending'],
            default: 'Belum Bayar',
          },
          catatan: { type: String, trim: true },
        },
      ],
    },

    timeline: [
      {
        id: { type: String, required: true },
        waktu: { type: Date, required: true },
        kegiatan: { type: String, required: true, trim: true },
        status: {
          type: String,
          enum: ['Akan Datang', 'Sedang Berlangsung', 'Selesai', 'Dibatalkan'],
          default: 'Akan Datang',
        },
        pic: { type: String, required: true, trim: true },
        catatan: { type: String, trim: true },
      },
    ],

    catatanProgres: [
      {
        id: { type: String, required: true },
        tanggal: { type: Date, required: true, default: Date.now },
        oleh: { type: String, required: true, trim: true },
        kategori: {
          type: String,
          enum: ['Info', 'Masalah', 'Solusi', 'Update'],
          required: true,
        },
        isi: { type: String, required: true, trim: true },
        tindakLanjut: { type: String, trim: true },
        statusTindakLanjut: {
          type: String,
          enum: ['Belum', 'Proses', 'Selesai'],
          default: 'Belum',
        },
      },
    ],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    lastModifiedBy: { type: String, required: true },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

// Indexes untuk performa query
ProgresLaporanAcaraSchema.index({ namaAcara: 1 });
ProgresLaporanAcaraSchema.index({ departemen: 1 });
ProgresLaporanAcaraSchema.index({ statusAcara: 1 });
ProgresLaporanAcaraSchema.index({ 'jadwalAcara.tanggalMulai': 1 });
ProgresLaporanAcaraSchema.index({ createdBy: 1 });

// Middleware untuk update timestamp
ProgresLaporanAcaraSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  next();
});

// Virtual untuk progres keseluruhan
ProgresLaporanAcaraSchema.virtual('progresKeseluruhan').get(function () {
  const totalTugas = this.tugasPanitia.reduce(
    (acc, panitia) => acc + panitia.daftarTugas.length,
    0
  );
  const tugasSelesai = this.tugasPanitia.reduce(
    (acc, panitia) =>
      acc + panitia.daftarTugas.filter((tugas) => tugas.status === 'Selesai').length,
    0
  );

  const totalKebutuhan = this.daftarKebutuhan.length;
  const kebutuhanSelesai = this.daftarKebutuhan.filter(
    (item) => item.status === 'Selesai'
  ).length;

  const totalKoordinasi = this.koordinasi.length;
  const koordinasiSelesai = this.koordinasi.filter(
    (item) => item.status === 'Selesai'
  ).length;

  const totalItem = totalTugas + totalKebutuhan + totalKoordinasi;
  const itemSelesai = tugasSelesai + kebutuhanSelesai + koordinasiSelesai;

  return totalItem > 0 ? Math.round((itemSelesai / totalItem) * 100) : 0;
});

// Virtual untuk status anggaran
ProgresLaporanAcaraSchema.virtual('statusAnggaran').get(function () {
  const persentaseRealisasi = this.anggaranProgres.totalAnggaranRencana > 0 
    ? (this.anggaranProgres.totalRealisasi / this.anggaranProgres.totalAnggaranRencana) * 100 
    : 0;

  if (persentaseRealisasi <= 80) return 'Aman';
  if (persentaseRealisasi <= 100) return 'Mendekati Batas';
  return 'Melebihi Anggaran';
});

export default mongoose.models.ProgresLaporanAcara ||
  mongoose.model<IProgresLaporanAcara>('ProgresLaporanAcara', ProgresLaporanAcaraSchema);
