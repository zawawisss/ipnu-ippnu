const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Import model Kaderisasi
const KaderisasiSchema = new mongoose.Schema({
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
    enum: ['PKD', 'PKL', 'PKN']
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
}, {
  timestamps: true
});

const Kaderisasi = mongoose.model('Kaderisasi', KaderisasiSchema);

// Fungsi untuk mengonversi tanggal Excel ke JavaScript Date
function excelDateToJSDate(excelDate) {
  if (!excelDate) return null;
  
  // Jika sudah dalam format string tanggal
  if (typeof excelDate === 'string') {
    const date = new Date(excelDate);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // Jika dalam format serial number Excel
  if (typeof excelDate === 'number') {
    const excelEpoch = new Date(1900, 0, 1);
    const jsDate = new Date(excelEpoch.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000);
    return jsDate;
  }
  
  return null;
}

// Fungsi untuk membersihkan dan memvalidasi data
function cleanData(row) {
  return {
    nama: row.nama || row.Nama || row.NAMA || '',
    nim: row.nim || row.NIM || row.Nim || '',
    komisariat: row.komisariat || row.Komisariat || row.KOMISARIAT || row.sekolah || row.Sekolah || '',
    kecamatan: row.kecamatan || row.Kecamatan || row.KECAMATAN || '',
    desa: row.desa || row.Desa || row.DESA || row.kelurahan || row.Kelurahan || '',
    jenjangKader: mapJenjangKader(row.jenjang || row.Jenjang || row.jenjang_kader || row.tingkat || ''),
    statusKader: mapStatusKader(row.status || row.Status || row.status_kader || ''),
    tanggalMulai: excelDateToJSDate(row.tanggal_mulai || row.tgl_mulai || row.start_date || row.tanggalMulai),
    tanggalSelesai: excelDateToJSDate(row.tanggal_selesai || row.tgl_selesai || row.end_date || row.tanggalSelesai),
    mentor: row.mentor || row.Mentor || row.pembimbing || row.Pembimbing || '',
    materiSelesai: parseMateriSelesai(row.materi || row.Materi || row.materi_selesai || ''),
    nilaiAkhir: parseFloat(row.nilai || row.Nilai || row.nilai_akhir || row.score || 0) || undefined,
    sertifikat: parseSertifikat(row.sertifikat || row.Sertifikat || row.certificate || ''),
    catatan: row.catatan || row.Catatan || row.keterangan || row.Keterangan || '',
    organization: mapOrganization(row.organisasi || row.Organisasi || row.organization || '')
  };
}

// Fungsi mapping untuk jenjang kader
function mapJenjangKader(value) {
  if (!value) return 'PKD';
  const str = value.toString().toLowerCase();
  if (str.includes('dasar') || str.includes('pkd') || str.includes('basic')) return 'PKD';
  if (str.includes('lanjutan') || str.includes('pkl') || str.includes('advanced')) return 'PKL';
  if (str.includes('nasional') || str.includes('pkn') || str.includes('national')) return 'PKN';
  return 'PKD'; // default
}

// Fungsi mapping untuk status kader
function mapStatusKader(value) {
  if (!value) return 'Aktif';
  const str = value.toString().toLowerCase();
  if (str.includes('aktif') || str.includes('active')) return 'Aktif';
  if (str.includes('tidak') || str.includes('inactive') || str.includes('non')) return 'Tidak Aktif';
  if (str.includes('alumni') || str.includes('graduate')) return 'Alumni';
  return 'Aktif'; // default
}

// Fungsi mapping untuk organisasi
function mapOrganization(value) {
  if (!value) return 'IPNU';
  const str = value.toString().toLowerCase();
  if (str.includes('ippnu') || str.includes('putri')) return 'IPPNU';
  return 'IPNU'; // default
}

// Fungsi untuk parsing materi selesai
function parseMateriSelesai(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }
  return [];
}

// Fungsi untuk parsing sertifikat
function parseSertifikat(value) {
  if (!value) return false;
  const str = value.toString().toLowerCase();
  return str.includes('ya') || str.includes('yes') || str.includes('true') || str === '1';
}

// Fungsi utama untuk import data
async function importKaderisasiData(filePath) {
  try {
    console.log('🔄 Memulai import data kaderisasi...');
    
    // Koneksi ke MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Berhasil terhubung ke MongoDB');

    // Baca file Excel
    console.log(`📖 Membaca file Excel: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    
    // Ambil worksheet pertama
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Konversi ke JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`📊 Ditemukan ${jsonData.length} baris data`);

    if (jsonData.length === 0) {
      console.log('❌ Tidak ada data untuk diimport');
      return;
    }

    // Tampilkan struktur data untuk verifikasi
    console.log('🔍 Struktur data:');
    console.log('Kolom yang ditemukan:', Object.keys(jsonData[0]));
    console.log('Contoh data baris pertama:', jsonData[0]);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Proses setiap baris data
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i];
        const cleanedData = cleanData(row);
        
        // Validasi data wajib
        if (!cleanedData.nama || !cleanedData.komisariat || !cleanedData.kecamatan || 
            !cleanedData.desa || !cleanedData.mentor) {
          throw new Error(`Baris ${i + 2}: Data wajib tidak lengkap (nama, komisariat, kecamatan, desa, mentor)`);
        }

        if (!cleanedData.tanggalMulai) {
          throw new Error(`Baris ${i + 2}: Tanggal mulai tidak valid`);
        }

        // Cek duplikasi berdasarkan nama dan komisariat
        const existing = await Kaderisasi.findOne({
          nama: cleanedData.nama,
          komisariat: cleanedData.komisariat,
          organization: cleanedData.organization
        });

        if (existing) {
          console.log(`⚠️  Data sudah ada: ${cleanedData.nama} (${cleanedData.komisariat}) - dilewati`);
          continue;
        }

        // Simpan ke database
        const kaderisasi = new Kaderisasi(cleanedData);
        await kaderisasi.save();
        
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`✅ Berhasil import ${successCount} data...`);
        }

      } catch (error) {
        errorCount++;
        const errorMsg = `Baris ${i + 2}: ${error.message}`;
        errors.push(errorMsg);
        console.log(`❌ ${errorMsg}`);
      }
    }

    // Laporan hasil
    console.log('\n📋 LAPORAN IMPORT:');
    console.log(`✅ Berhasil: ${successCount} data`);
    console.log(`❌ Gagal: ${errorCount} data`);
    
    if (errors.length > 0) {
      console.log('\n🚨 Detail Error:');
      errors.forEach(error => console.log(`   - ${error}`));
    }

    // Tampilkan statistik
    const stats = await Kaderisasi.aggregate([
      {
        $group: {
          _id: '$organization',
          total: { $sum: 1 },
          aktif: {
            $sum: { $cond: [{ $eq: ['$statusKader', 'Aktif'] }, 1, 0] }
          },
          pkd: {
            $sum: { $cond: [{ $eq: ['$jenjangKader', 'PKD'] }, 1, 0] }
          },
          pkl: {
            $sum: { $cond: [{ $eq: ['$jenjangKader', 'PKL'] }, 1, 0] }
          },
          pkn: {
            $sum: { $cond: [{ $eq: ['$jenjangKader', 'PKN'] }, 1, 0] }
          }
        }
      }
    ]);

    console.log('\n📊 STATISTIK DATA:');
    stats.forEach(stat => {
      console.log(`${stat._id}:`);
      console.log(`   Total: ${stat.total}`);
      console.log(`   Aktif: ${stat.aktif}`);
      console.log(`   PKD: ${stat.pkd}, PKL: ${stat.pkl}, PKN: ${stat.pkn}`);
    });

  } catch (error) {
    console.error('💥 Error saat import:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Koneksi MongoDB ditutup');
  }
}

// Jalankan script jika dipanggil langsung
if (require.main === module) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.log('❌ Harap berikan path file Excel');
    console.log('Contoh: node scripts/import-kaderisasi.js path/to/data.xlsx');
    process.exit(1);
  }

  if (!require('fs').existsSync(filePath)) {
    console.log('❌ File tidak ditemukan:', filePath);
    process.exit(1);
  }

  importKaderisasiData(filePath);
}

module.exports = { importKaderisasiData };
