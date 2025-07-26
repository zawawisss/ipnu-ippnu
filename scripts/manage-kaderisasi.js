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
  organization: { type: String, required: true, enum: ['IPNU', 'IPPNU'] }
}, { timestamps: true });

const Kaderisasi = mongoose.model('Kaderisasi', KaderisasiSchema);

// Fungsi untuk menampilkan statistik
async function showStats() {
  try {
    console.log('🔄 Mengambil statistik data kaderisasi...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Berhasil terhubung ke MongoDB');

    // Total data
    const totalData = await Kaderisasi.countDocuments();
    console.log(`\n📊 TOTAL DATA: ${totalData} records`);

    if (totalData === 0) {
      console.log('❌ Tidak ada data kaderisasi');
      return;
    }

    // Statistik per organisasi
    const orgStats = await Kaderisasi.aggregate([
      {
        $group: {
          _id: '$organization',
          total: { $sum: 1 },
          aktif: { $sum: { $cond: [{ $eq: ['$statusKader', 'Aktif'] }, 1, 0] } },
          alumni: { $sum: { $cond: [{ $eq: ['$statusKader', 'Alumni'] }, 1, 0] } },
          nonAktif: { $sum: { $cond: [{ $eq: ['$statusKader', 'Tidak Aktif'] }, 1, 0] } },
          pkd: { $sum: { $cond: [{ $eq: ['$jenjangKader', 'PKD'] }, 1, 0] } },
          pkl: { $sum: { $cond: [{ $eq: ['$jenjangKader', 'PKL'] }, 1, 0] } },
          pkn: { $sum: { $cond: [{ $eq: ['$jenjangKader', 'PKN'] }, 1, 0] } },
          bersertifikat: { $sum: { $cond: ['$sertifikat', 1, 0] } },
          avgNilai: { $avg: '$nilaiAkhir' }
        }
      }
    ]);

    console.log('\n📈 STATISTIK PER ORGANISASI:');
    orgStats.forEach(stat => {
      console.log(`\n${stat._id}:`);
      console.log(`   📝 Total: ${stat.total}`);
      console.log(`   ✅ Aktif: ${stat.aktif}`);
      console.log(`   🎓 Alumni: ${stat.alumni}`);
      console.log(`   ❌ Tidak Aktif: ${stat.nonAktif}`);
      console.log(`   📚 PKD: ${stat.pkd}, PKL: ${stat.pkl}, PKN: ${stat.pkn}`);
      console.log(`   🏆 Bersertifikat: ${stat.bersertifikat}`);
      console.log(`   📊 Rata-rata Nilai: ${stat.avgNilai ? stat.avgNilai.toFixed(2) : 'N/A'}`);
    });

    // Top komisariat
    const topKomisariat = await Kaderisasi.aggregate([
      {
        $group: {
          _id: { komisariat: '$komisariat', organization: '$organization' },
          total: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    console.log('\n🏫 TOP 5 KOMISARIAT:');
    topKomisariat.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item._id.komisariat} (${item._id.organization}): ${item.total} kader`);
    });

    // Top mentor
    const topMentor = await Kaderisasi.aggregate([
      {
        $group: {
          _id: '$mentor',
          total: { $sum: 1 },
          organizations: { $addToSet: '$organization' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    console.log('\n👨‍🏫 TOP 5 MENTOR:');
    topMentor.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item._id} (${item.organizations.join(', ')}): ${item.total} kader`);
    });

  } catch (error) {
    console.error('💥 Error saat mengambil statistik:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Koneksi MongoDB ditutup');
  }
}

// Fungsi untuk membersihkan semua data
async function clearAllData() {
  try {
    console.log('⚠️  PERINGATAN: Anda akan menghapus SEMUA data kaderisasi!');
    console.log('📝 Ketik "HAPUS SEMUA" untuk melanjutkan:');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const confirmation = await new Promise(resolve => {
      rl.question('> ', resolve);
    });
    rl.close();

    if (confirmation !== 'HAPUS SEMUA') {
      console.log('❌ Operasi dibatalkan');
      return;
    }

    console.log('🔄 Menghapus semua data kaderisasi...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Berhasil terhubung ke MongoDB');

    const result = await Kaderisasi.deleteMany({});
    console.log(`🗑️  Berhasil menghapus ${result.deletedCount} data kaderisasi`);

  } catch (error) {
    console.error('💥 Error saat menghapus data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Koneksi MongoDB ditutup');
  }
}

// Fungsi untuk export data ke Excel
async function exportToExcel() {
  try {
    console.log('🔄 Mengexport data kaderisasi ke Excel...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Berhasil terhubung ke MongoDB');

    const data = await Kaderisasi.find({}).sort({ organization: 1, createdAt: -1 }).lean();
    
    if (data.length === 0) {
      console.log('❌ Tidak ada data untuk diexport');
      return;
    }

    // Format data untuk Excel
    const excelData = data.map(item => ({
      nama: item.nama,
      nim: item.nim || '',
      komisariat: item.komisariat,
      kecamatan: item.kecamatan,
      desa: item.desa,
      jenjang: item.jenjangKader,
      status: item.statusKader,
      tanggal_mulai: item.tanggalMulai ? item.tanggalMulai.toISOString().split('T')[0] : '',
      tanggal_selesai: item.tanggalSelesai ? item.tanggalSelesai.toISOString().split('T')[0] : '',
      mentor: item.mentor,
      materi: item.materiSelesai.join(', '),
      nilai: item.nilaiAkhir || '',
      sertifikat: item.sertifikat ? 'Ya' : 'Tidak',
      catatan: item.catatan || '',
      organisasi: item.organization,
      created_at: item.createdAt.toISOString().split('T')[0]
    }));

    // Buat workbook dan worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Tambah worksheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kaderisasi');

    // Tentukan path file output
    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(__dirname, `../export-kaderisasi-${timestamp}.xlsx`);

    // Tulis file Excel
    XLSX.writeFile(workbook, outputPath);

    console.log('✅ Export berhasil!');
    console.log(`📁 File disimpan di: ${outputPath}`);
    console.log(`📊 Total data: ${data.length} records`);

  } catch (error) {
    console.error('💥 Error saat export:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Koneksi MongoDB ditutup');
  }
}

// Fungsi untuk menampilkan data terbaru
async function showLatestData(limit = 10) {
  try {
    console.log(`🔄 Mengambil ${limit} data kaderisasi terbaru...`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Berhasil terhubung ke MongoDB');

    const data = await Kaderisasi.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (data.length === 0) {
      console.log('❌ Tidak ada data kaderisasi');
      return;
    }

    console.log(`\n📋 ${limit} DATA TERBARU:`);
    data.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.nama} (${item.organization})`);
      console.log(`   📚 ${item.jenjangKader} - ${item.statusKader}`);
      console.log(`   🏫 ${item.komisariat}`);
      console.log(`   👨‍🏫 Mentor: ${item.mentor}`);
      console.log(`   📅 ${item.createdAt.toISOString().split('T')[0]}`);
    });

  } catch (error) {
    console.error('💥 Error saat mengambil data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Koneksi MongoDB ditutup');
  }
}

// Main function
async function main() {
  const command = process.argv[2];
  const param = process.argv[3];

  switch (command) {
    case 'stats':
      await showStats();
      break;
    case 'clear':
      await clearAllData();
      break;
    case 'export':
      await exportToExcel();
      break;
    case 'latest':
      const limit = param ? parseInt(param) : 10;
      await showLatestData(limit);
      break;
    default:
      console.log('📖 MANAJEMEN DATA KADERISASI');
      console.log('\nCommand yang tersedia:');
      console.log('  stats   - Tampilkan statistik data');
      console.log('  latest  - Tampilkan data terbaru (default: 10)');
      console.log('  export  - Export semua data ke Excel');
      console.log('  clear   - Hapus semua data (hati-hati!)');
      console.log('\nContoh penggunaan:');
      console.log('  node scripts/manage-kaderisasi.js stats');
      console.log('  node scripts/manage-kaderisasi.js latest 5');
      console.log('  node scripts/manage-kaderisasi.js export');
      console.log('  node scripts/manage-kaderisasi.js clear');
      break;
  }
}

// Jalankan jika dipanggil langsung
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { showStats, clearAllData, exportToExcel, showLatestData };
