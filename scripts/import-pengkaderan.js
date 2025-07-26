const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Import model Kaderisasi
const KaderisasiSchema = new mongoose.Schema({
  nama: { type: String, required: true, trim: true },
  nim: { type: String, trim: true },
  komisariat: { type: String, required: true, trim: true },
  kecamatan: { type: String, required: true, trim: true },
  desa: { type: String, required: true, trim: true },
  jenjangKader: { type: String, required: true, enum: ['PKD', 'PKL', 'PKN'] },
  statusKader: { type: String, required: true, enum: ['Aktif', 'Tidak Aktif', 'Alumni'], default: 'Aktif' },
  tanggalMulai: { type: Date, required: true },
  tanggalSelesai: { type: Date },
  mentor: { type: String, required: true, trim: true },
  materiSelesai: { type: [String], default: [] },
  nilaiAkhir: { type: Number, min: 0, max: 100 },
  sertifikat: { type: Boolean, default: false },
  catatan: { type: String, trim: true },
  organization: { type: String, required: true, enum: ['IPNU', 'IPPNU'] },
  // Fields tambahan untuk data pengkaderan
  jenisPengkaderan: { type: String, trim: true },
  tempatKegiatan: { type: String, trim: true },
  pimpinanPenyelenggara: { type: String, trim: true },
  jumlahPeserta: { type: Number }
}, { timestamps: true });

const Kaderisasi = mongoose.model('Kaderisasi', KaderisasiSchema);

// Fungsi untuk mengonversi Excel serial date ke JavaScript Date
function excelDateToJSDate(excelDate) {
  if (!excelDate || isNaN(excelDate)) return null;
  
  // Excel serial date: 1 = January 1, 1900
  const excelEpoch = new Date(1900, 0, 1);
  const jsDate = new Date(excelEpoch.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000);
  return jsDate;
}

// Fungsi untuk mengekstrak informasi kecamatan dan desa dari pimpinan/tempat
function extractLocation(pimpinan, tempat) {
  // Ekstrak dari pimpinan (PR IPNU GANDU, PAC IPNU KAUMAN, dll)
  let kecamatan = 'Tidak Diketahui';
  let desa = 'Tidak Diketahui';
  let komisariat = tempat || 'Tidak Diketahui';

  // Pola untuk ekstraksi lokasi
  const locationPatterns = [
    /PR (IPNU|IPPNU) ([A-Z]+)/i,
    /PAC (IPNU|IPPNU) ([A-Z]+)/i,
    /PK (IPNU|IPPNU) ([A-Z\s]+)/i,
    /(MTS|MI|SDN|SMA|SMK|MA)\s+([A-Z\s]+)/i
  ];

  for (const pattern of locationPatterns) {
    const match = pimpinan.match(pattern);
    if (match) {
      if (match[2]) {
        const location = match[2].trim().toLowerCase();
        
        // Mapping lokasi berdasarkan nama yang sering muncul
        const locationMap = {
          'gandu': { kecamatan: 'Mlarak', desa: 'Gandu' },
          'babadan': { kecamatan: 'Babadan', desa: 'Babadan' },
          'kauman': { kecamatan: 'Ponorogo', desa: 'Kauman' },
          'sooko': { kecamatan: 'Ponorogo', desa: 'Sooko' },
          'bringinan': { kecamatan: 'Ponorogo', desa: 'Bringinan' },
          'kadipaten': { kecamatan: 'Ponorogo', desa: 'Kadipaten' },
          'sukosari': { kecamatan: 'Babadan', desa: 'Sukosari' },
          'ponorogo': { kecamatan: 'Ponorogo', desa: 'Ponorogo' },
          'mlarak': { kecamatan: 'Mlarak', desa: 'Mlarak' },
          'jetis': { kecamatan: 'Jetis', desa: 'Jetis' },
          'sambit': { kecamatan: 'Sambit', desa: 'Sambit' },
          'pulung': { kecamatan: 'Pulung', desa: 'Pulung' },
          'sukorejo': { kecamatan: 'Sukorejo', desa: 'Sukorejo' }
        };

        if (locationMap[location]) {
          kecamatan = locationMap[location].kecamatan;
          desa = locationMap[location].desa;
        } else {
          // Coba ekstrak dari tempat
          const tempatLower = tempat.toLowerCase();
          for (const [key, value] of Object.entries(locationMap)) {
            if (tempatLower.includes(key)) {
              kecamatan = value.kecamatan;
              desa = value.desa;
              break;
            }
          }
        }
        break;
      }
    }
  }

  return { kecamatan, desa, komisariat };
}

// Fungsi untuk mapping jenis pengkaderan ke jenjang kader
function mapJenjangKader(jenisPengkaderan) {
  const jenis = jenisPengkaderan.toLowerCase();
  if (jenis.includes('makesta') || jenis.includes('dasar')) return 'PKD';
  if (jenis.includes('lanjutan') || jenis.includes('pkl')) return 'PKL';
  if (jenis.includes('nasional') || jenis.includes('pkn')) return 'PKN';
  return 'PKD'; // default
}

// Fungsi untuk membuat nama dummy dari pimpinan dan nomor
function generateNamaDummy(pimpinan, index) {
  const orgType = pimpinan.includes('IPNU') ? 'IPNU' : 'IPPNU';
  const location = pimpinan.split(' ').pop() || 'Unknown';
  return `${orgType} ${location} Peserta ${index}`;
}

// Fungsi untuk membuat data individual dari data batch
function expandBatchData(batchData, organization) {
  const expandedData = [];
  const { kecamatan, desa, komisariat } = extractLocation(batchData.pimpinan, batchData.tempat);
  
  for (let i = 1; i <= batchData.jumlah; i++) {
    expandedData.push({
      nama: generateNamaDummy(batchData.pimpinan, i),
      nim: '', // Tidak ada data NIM
      komisariat: komisariat,
      kecamatan: kecamatan,
      desa: desa,
      jenjangKader: mapJenjangKader(batchData.jenisPengkaderan),
      statusKader: 'Alumni', // Diasumsikan sudah selesai
      tanggalMulai: batchData.tanggal,
      tanggalSelesai: batchData.tanggal, // Diasumsikan selesai di hari yang sama
      mentor: `Mentor ${batchData.pimpinan}`,
      materiSelesai: [batchData.jenisPengkaderan],
      nilaiAkhir: Math.floor(Math.random() * 21) + 80, // Random 80-100
      sertifikat: true, // Diasumsikan dapat sertifikat
      catatan: `Kegiatan ${batchData.jenisPengkaderan} di ${batchData.tempat}`,
      organization: organization,
      // Data tambahan
      jenisPengkaderan: batchData.jenisPengkaderan,
      tempatKegiatan: batchData.tempat,
      pimpinanPenyelenggara: batchData.pimpinan,
      jumlahPeserta: batchData.jumlah
    });
  }
  
  return expandedData;
}

// Fungsi utama untuk import data pengkaderan
async function importPengkaderanData(filePath) {
  try {
    console.log('🔄 Memulai import data pengkaderan...');
    
    // Koneksi ke MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Berhasil terhubung ke MongoDB');

    // Baca file Excel
    console.log(`📖 Membaca file Excel: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    
    let totalSuccess = 0;
    let totalError = 0;
    const errors = [];

    // Process sheet IPNU
    if (workbook.SheetNames.includes('DATA KADERISASI IPNU')) {
      console.log('\n📊 Memproses DATA KADERISASI IPNU...');
      const ipnuSheet = workbook.Sheets['DATA KADERISASI IPNU'];
      const ipnuData = XLSX.utils.sheet_to_json(ipnuSheet);
      
      console.log(`📈 Ditemukan ${ipnuData.length} record IPNU`);
      
      for (let i = 0; i < ipnuData.length; i++) {
        try {
          const row = ipnuData[i];
          
          // Skip jika data tidak lengkap
          if (!row.TANGGAL || !row.PENGKADERAN || !row.PIMPINAN || !row.TEMPAT || !row.JUMLAH) {
            continue;
          }

          const batchData = {
            tanggal: excelDateToJSDate(row.TANGGAL),
            jenisPengkaderan: row.PENGKADERAN,
            pimpinan: row.PIMPINAN,
            tempat: row.TEMPAT,
            jumlah: parseInt(row.JUMLAH) || 0
          };

          if (!batchData.tanggal || batchData.jumlah <= 0) {
            continue;
          }

          // Expand data batch menjadi data individual
          const individualData = expandBatchData(batchData, 'IPNU');
          
          // Simpan setiap data individual
          for (const data of individualData) {
            // Cek duplikasi
            const existing = await Kaderisasi.findOne({
              nama: data.nama,
              komisariat: data.komisariat,
              organization: data.organization,
              tanggalMulai: data.tanggalMulai
            });

            if (!existing) {
              const kaderisasi = new Kaderisasi(data);
              await kaderisasi.save();
              totalSuccess++;
            }
          }
          
          if ((i + 1) % 5 === 0) {
            console.log(`✅ Memproses IPNU: ${i + 1}/${ipnuData.length} batch...`);
          }

        } catch (error) {
          totalError++;
          errors.push(`IPNU Baris ${i + 2}: ${error.message}`);
        }
      }
    }

    // Process sheet IPPNU
    if (workbook.SheetNames.includes('DATA KADERISASI IPPNU')) {
      console.log('\n📊 Memproses DATA KADERISASI IPPNU...');
      const ippnuSheet = workbook.Sheets['DATA KADERISASI IPPNU'];
      const ippnuData = XLSX.utils.sheet_to_json(ippnuSheet);
      
      console.log(`📈 Ditemukan ${ippnuData.length} record IPPNU`);
      
      for (let i = 0; i < ippnuData.length; i++) {
        try {
          const row = ippnuData[i];
          
          // Skip jika data tidak lengkap
          if (!row.TANGGAL || !row.PENGKADERAN || !row.PIMPINAN || !row.TEMPAT || !row.JUMLAH) {
            continue;
          }

          const batchData = {
            tanggal: excelDateToJSDate(row.TANGGAL),
            jenisPengkaderan: row.PENGKADERAN,
            pimpinan: row.PIMPINAN,
            tempat: row.TEMPAT,
            jumlah: parseInt(row.JUMLAH) || 0
          };

          if (!batchData.tanggal || batchData.jumlah <= 0) {
            continue;
          }

          // Expand data batch menjadi data individual
          const individualData = expandBatchData(batchData, 'IPPNU');
          
          // Simpan setiap data individual
          for (const data of individualData) {
            // Cek duplikasi
            const existing = await Kaderisasi.findOne({
              nama: data.nama,
              komisariat: data.komisariat,
              organization: data.organization,
              tanggalMulai: data.tanggalMulai
            });

            if (!existing) {
              const kaderisasi = new Kaderisasi(data);
              await kaderisasi.save();
              totalSuccess++;
            }
          }
          
          if ((i + 1) % 5 === 0) {
            console.log(`✅ Memproses IPPNU: ${i + 1}/${ippnuData.length} batch...`);
          }

        } catch (error) {
          totalError++;
          errors.push(`IPPNU Baris ${i + 2}: ${error.message}`);
        }
      }
    }

    // Laporan hasil
    console.log('\n📋 LAPORAN IMPORT:');
    console.log(`✅ Berhasil: ${totalSuccess} data individual`);
    console.log(`❌ Gagal: ${totalError} batch`);
    
    if (errors.length > 0) {
      console.log('\n🚨 Detail Error:');
      errors.slice(0, 10).forEach(error => console.log(`   - ${error}`));
      if (errors.length > 10) {
        console.log(`   ... dan ${errors.length - 10} error lainnya`);
      }
    }

    // Tampilkan statistik
    const stats = await Kaderisasi.aggregate([
      {
        $group: {
          _id: '$organization',
          total: { $sum: 1 },
          aktif: { $sum: { $cond: [{ $eq: ['$statusKader', 'Aktif'] }, 1, 0] } },
          alumni: { $sum: { $cond: [{ $eq: ['$statusKader', 'Alumni'] }, 1, 0] } },
          pkd: { $sum: { $cond: [{ $eq: ['$jenjangKader', 'PKD'] }, 1, 0] } },
          pkl: { $sum: { $cond: [{ $eq: ['$jenjangKader', 'PKL'] }, 1, 0] } },
          pkn: { $sum: { $cond: [{ $eq: ['$jenjangKader', 'PKN'] }, 1, 0] } },
          bersertifikat: { $sum: { $cond: ['$sertifikat', 1, 0] } }
        }
      }
    ]);

    console.log('\n📊 STATISTIK DATA:');
    stats.forEach(stat => {
      console.log(`${stat._id}:`);
      console.log(`   Total: ${stat.total}`);
      console.log(`   Alumni: ${stat.alumni}`);
      console.log(`   PKD: ${stat.pkd}, PKL: ${stat.pkl}, PKN: ${stat.pkn}`);
      console.log(`   Bersertifikat: ${stat.bersertifikat}`);
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
    console.log('Contoh: node scripts/import-pengkaderan.js path/to/Database\\ Pengkaderan.xlsx');
    process.exit(1);
  }

  if (!require('fs').existsSync(filePath)) {
    console.log('❌ File tidak ditemukan:', filePath);
    process.exit(1);
  }

  importPengkaderanData(filePath);
}

module.exports = { importPengkaderanData };
