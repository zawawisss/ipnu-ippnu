const XLSX = require('xlsx');
const path = require('path');

// Data sample kaderisasi
const sampleData = [
  {
    nama: 'Ahmad Fauzi',
    nim: '2021001001',
    komisariat: 'SMK Negeri 1 Ponorogo',
    kecamatan: 'Ponorogo',
    desa: 'Tonatan',
    jenjang: 'PKD',
    status: 'Aktif',
    tanggal_mulai: '2024-01-15',
    tanggal_selesai: '2024-03-15',
    mentor: 'Ustadz Abdullah',
    materi: 'Sejarah IPNU-IPPNU, Ideologi Pancasila, Kepemimpinan',
    nilai: 85,
    sertifikat: 'Ya',
    catatan: 'Peserta aktif dan antusias',
    organisasi: 'IPNU'
  },
  {
    nama: 'Siti Fatimah',
    nim: '2021002001',
    komisariat: 'MA Negeri 1 Ponorogo',
    kecamatan: 'Ponorogo',
    desa: 'Ronowijayan',
    jenjang: 'PKL',
    status: 'Alumni',
    tanggal_mulai: '2023-08-10',
    tanggal_selesai: '2023-12-10',
    mentor: 'Ustadzah Khadijah',
    materi: 'Manajemen Strategis, Public Speaking, Women Leadership',
    nilai: 92,
    sertifikat: 'Ya',
    catatan: 'Lulusan terbaik angkatan',
    organisasi: 'IPPNU'
  },
  {
    nama: 'Muhammad Rizki',
    nim: '2020003001',
    komisariat: 'SMA Negeri 2 Ponorogo',
    kecamatan: 'Babadan',
    desa: 'Babadan',
    jenjang: 'PKN',
    status: 'Aktif',
    tanggal_mulai: '2024-02-01',
    tanggal_selesai: '',
    mentor: 'Ustadz Muhammad',
    materi: 'Leadership Excellence, Policy Making',
    nilai: 88,
    sertifikat: 'Tidak',
    catatan: 'Sedang dalam proses pelatihan',
    organisasi: 'IPNU'
  },
  {
    nama: 'Nurul Hidayah',
    nim: '2021004001',
    komisariat: 'SMK Muhammadiyah Ponorogo',
    kecamatan: 'Kauman',
    desa: 'Kauman',
    jenjang: 'PKD',
    status: 'Tidak Aktif',
    tanggal_mulai: '2023-09-01',
    tanggal_selesai: '2023-11-01',
    mentor: 'Ustadzah Aisyah',
    materi: 'Sejarah IPNU-IPPNU',
    nilai: 75,
    sertifikat: 'Tidak',
    catatan: 'Mengundurkan diri karena kesibukan kuliah',
    organisasi: 'IPPNU'
  },
  {
    nama: 'Abdul Rahman',
    nim: '2020005001',
    komisariat: 'MA Darul Huda',
    kecamatan: 'Sukorejo',
    desa: 'Sukorejo',
    jenjang: 'PKL',
    status: 'Aktif',
    tanggal_mulai: '2024-01-20',
    tanggal_selesai: '',
    mentor: 'Ustadz Hasan',
    materi: 'Manajemen Strategis, Advocacy dan Lobbying',
    nilai: 90,
    sertifikat: 'Tidak',
    catatan: 'Menunjukkan progress yang baik',
    organisasi: 'IPNU'
  },
  {
    nama: 'Dewi Sartika',
    nim: '2021006001',
    komisariat: 'SMA Negeri 3 Ponorogo',
    kecamatan: 'Mlarak',
    desa: 'Mlarak',
    jenjang: 'PKD',
    status: 'Alumni',
    tanggal_mulai: '2023-06-01',
    tanggal_selesai: '2023-08-01',
    mentor: 'Ustadzah Maryam',
    materi: 'Sejarah IPNU-IPPNU, Kepemimpinan Perempuan, Gender dan Pemberdayaan Perempuan',
    nilai: 87,
    sertifikat: 'Ya',
    catatan: 'Aktif dalam kegiatan organisasi',
    organisasi: 'IPPNU'
  },
  {
    nama: 'Fadhil Akbar',
    nim: '2019007001',
    komisariat: 'SMK Negeri 2 Ponorogo',
    kecamatan: 'Sambit',
    desa: 'Sambit',
    jenjang: 'PKN',
    status: 'Alumni',
    tanggal_mulai: '2022-03-01',
    tanggal_selesai: '2022-09-01',
    mentor: 'Ustadz Ibrahim',
    materi: 'Leadership Excellence, Policy Making, International Relations, Research and Development',
    nilai: 95,
    sertifikat: 'Ya',
    catatan: 'Lulusan terbaik PKN, sekarang menjadi mentor junior',
    organisasi: 'IPNU'
  },
  {
    nama: 'Laila Maghfiroh',
    nim: '2020008001',
    komisariat: 'MA Negeri 2 Ponorogo',
    kecamatan: 'Jetis',
    desa: 'Jetis',
    jenjang: 'PKL',
    status: 'Aktif',
    tanggal_mulai: '2023-11-15',
    tanggal_selesai: '',
    mentor: 'Ustadzah Zahra',
    materi: 'Public Speaking, Women Leadership',
    nilai: 86,
    sertifikat: 'Tidak',
    catatan: 'Sedang fokus pada materi public speaking',
    organisasi: 'IPPNU'
  },
  {
    nama: 'Ilham Hakim',
    nim: '2021009001',
    komisariat: 'SMA Negeri 1 Babadan',
    kecamatan: 'Babadan',
    desa: 'Krebet',
    jenjang: 'PKD',
    status: 'Aktif',
    tanggal_mulai: '2024-02-15',
    tanggal_selesai: '',
    mentor: 'Ustadz Yusuf',
    materi: 'Sejarah IPNU-IPPNU, Ideologi Pancasila',
    nilai: 80,
    sertifikat: 'Tidak',
    catatan: 'Peserta baru yang penuh semangat',
    organisasi: 'IPNU'
  },
  {
    nama: 'Rahma Aulia',
    nim: '2020010001',
    komisariat: 'SMK Negeri 1 Mlarak',
    kecamatan: 'Mlarak',
    desa: 'Gandu',
    jenjang: 'PKD',
    status: 'Alumni',
    tanggal_mulai: '2023-04-01',
    tanggal_selesai: '2023-06-01',
    mentor: 'Ustadzah Nur',
    materi: 'Sejarah IPNU-IPPNU, Kepemimpinan Perempuan, Organisasi dan Manajemen',
    nilai: 89,
    sertifikat: 'Ya',
    catatan: 'Kini aktif sebagai pengurus IPPNU daerah',
    organisasi: 'IPPNU'
  }
];

function createSampleExcel() {
  try {
    console.log('🔄 Membuat file Excel sample...');
    
    // Buat workbook dan worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // Tambah worksheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kaderisasi');
    
    // Tentukan path file output
    const outputPath = path.join(__dirname, '../sample-data-kaderisasi.xlsx');
    
    // Tulis file Excel
    XLSX.writeFile(workbook, outputPath);
    
    console.log('✅ File Excel sample berhasil dibuat!');
    console.log(`📁 Lokasi: ${outputPath}`);
    console.log(`📊 Jumlah data: ${sampleData.length} baris`);
    
    // Tampilkan statistik
    const ipnuCount = sampleData.filter(item => item.organisasi === 'IPNU').length;
    const ippnuCount = sampleData.filter(item => item.organisasi === 'IPPNU').length;
    const pkdCount = sampleData.filter(item => item.jenjang === 'PKD').length;
    const pklCount = sampleData.filter(item => item.jenjang === 'PKL').length;
    const pknCount = sampleData.filter(item => item.jenjang === 'PKN').length;
    const aktifCount = sampleData.filter(item => item.status === 'Aktif').length;
    const alumniCount = sampleData.filter(item => item.status === 'Alumni').length;
    
    console.log('\n📈 Statistik Data Sample:');
    console.log(`   IPNU: ${ipnuCount}, IPPNU: ${ippnuCount}`);
    console.log(`   PKD: ${pkdCount}, PKL: ${pklCount}, PKN: ${pknCount}`);
    console.log(`   Aktif: ${aktifCount}, Alumni: ${alumniCount}`);
    console.log(`   Bersertifikat: ${sampleData.filter(item => item.sertifikat === 'Ya').length}`);
    
    return outputPath;
    
  } catch (error) {
    console.error('💥 Error saat membuat file Excel:', error);
    throw error;
  }
}

// Jalankan jika dipanggil langsung
if (require.main === module) {
  createSampleExcel();
}

module.exports = { createSampleExcel, sampleData };
