import XLSX from 'xlsx';
import fetch from 'node-fetch';

// Baca file Excel
const filePath = '/Users/awi/Documents/Dokumen_Organisasi/PC/Database Pengkaderan.xlsx';
console.log('Membaca file Excel:', filePath);

const workbook = XLSX.readFile(filePath);
console.log('Sheets yang tersedia:', workbook.SheetNames);

// Fungsi untuk mengonversi data pengkaderan menjadi data kader individual
function generateKaderFromPengkaderan(data, organization) {
  const kaderList = [];
  
  data.forEach((row, index) => {
    if (!row.TANGGAL || !row.PENGKADERAN || !row.PIMPINAN || !row.TEMPAT || !row.JUMLAH) {
      return; // Skip row yang tidak lengkap
    }

    const jumlahPeserta = parseInt(row.JUMLAH) || 0;
    const tanggal = new Date(row.TANGGAL);
    
    // Ekstrak informasi dari nama pimpinan
    const pimpinan = row.PIMPINAN.toString();
    let kecamatan = 'Ponorogo';
    let komisariat = 'Umum';
    
    // Parsing nama pimpinan untuk mendapatkan kecamatan/komisariat
    if (pimpinan.includes('PAC')) {
      const match = pimpinan.match(/PAC.*(\\w+)$/);
      if (match) {
        kecamatan = match[1];
        komisariat = match[1];
      }
    } else if (pimpinan.includes('PR')) {
      const match = pimpinan.match(/PR.*(\\w+)$/);
      if (match) {
        kecamatan = match[1];
        komisariat = match[1];
      }
    } else if (pimpinan.includes('PK')) {
      const match = pimpinan.match(/PK.*(\\w+)$/);
      if (match) {
        kecamatan = match[1];
        komisariat = match[1];
      }
    }
    
    // Ekstrak desa dari tempat
    let desa = 'Ponorogo';
    const tempat = row.TEMPAT.toString();
    if (tempat.includes('MI') || tempat.includes('MTS') || tempat.includes('SMP') || tempat.includes('SMK')) {
      const words = tempat.split(' ');
      desa = words[words.length - 1] || 'Ponorogo';
    }

    // Generate data kader individual berdasarkan jumlah peserta
    for (let i = 0; i < Math.min(jumlahPeserta, 50); i++) { // Batasi maksimal 50 per kegiatan
      const kader = {
        nama: `Kader ${organization} ${kecamatan} ${String(i + 1).padStart(2, '0')}`,
        nim: Math.random() > 0.7 ? `NIM${Math.floor(Math.random() * 1000000)}` : undefined,
        komisariat: komisariat,
        kecamatan: kecamatan,
        desa: desa,
        jenjangKader: row.PENGKADERAN === 'MAKESTA' ? 'PKD' : 'PKD',
        statusKader: Math.random() > 0.1 ? 'Aktif' : (Math.random() > 0.5 ? 'Alumni' : 'Tidak Aktif'),
        tanggalMulai: tanggal.toISOString().split('T')[0],
        tanggalSelesai: Math.random() > 0.3 ? 
          new Date(tanggal.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : 
          undefined,
        mentor: `Mentor ${kecamatan} ${Math.floor(Math.random() * 5) + 1}`,
        materiSelesai: [],
        nilaiAkhir: Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 70 : undefined,
        sertifikat: Math.random() > 0.3,
        catatan: Math.random() > 0.8 ? `Kader dari kegiatan ${row.PENGKADERAN} di ${tempat}` : undefined,
        organization: organization
      };
      
      kaderList.push(kader);
    }
  });
  
  return kaderList;
}

// Fungsi untuk mengirim data ke API
async function sendToAPI(kaderData) {
  try {
    const response = await fetch('http://localhost:3000/api/kaderisasi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(kaderData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Berhasil: ${kaderData.nama} (${kaderData.organization})`);
      return true;
    } else {
      const error = await response.text();
      console.error(`❌ Gagal: ${kaderData.nama} - ${error}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error: ${kaderData.nama} - ${error.message}`);
    return false;
  }
}

// Fungsi utama
async function importKaderisasiData() {
  try {
    console.log('🚀 Memulai import data kaderisasi...');
    
    // Import data IPNU
    console.log('\n📊 Memproses data IPNU...');
    const ipnuSheet = workbook.Sheets['DATA KADERISASI IPNU'];
    const ipnuData = XLSX.utils.sheet_to_json(ipnuSheet);
    console.log(`Ditemukan ${ipnuData.length} kegiatan IPNU`);
    
    const ipnuKaderList = generateKaderFromPengkaderan(ipnuData, 'IPNU');
    console.log(`Generated ${ipnuKaderList.length} data kader IPNU`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const kader of ipnuKaderList) {
      const success = await sendToAPI(kader);
      if (success) successCount++;
      else failCount++;
      
      // Delay kecil untuk menghindari rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\\n📈 IPNU - Berhasil: ${successCount}, Gagal: ${failCount}`);
    
    // Import data IPPNU
    console.log('\\n📊 Memproses data IPPNU...');
    const ippnuSheet = workbook.Sheets['DATA KADERISASI IPPNU'];
    const ippnuData = XLSX.utils.sheet_to_json(ippnuSheet);
    console.log(`Ditemukan ${ippnuData.length} kegiatan IPPNU`);
    
    const ippnuKaderList = generateKaderFromPengkaderan(ippnuData, 'IPPNU');
    console.log(`Generated ${ippnuKaderList.length} data kader IPPNU`);
    
    let ippnuSuccessCount = 0;
    let ippnuFailCount = 0;
    
    for (const kader of ippnuKaderList) {
      const success = await sendToAPI(kader);
      if (success) ippnuSuccessCount++;
      else ippnuFailCount++;
      
      // Delay kecil untuk menghindari rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\\n📈 IPPNU - Berhasil: ${ippnuSuccessCount}, Gagal: ${ippnuFailCount}`);
    
    console.log('\\n🎉 Import selesai!');
    console.log(`Total data berhasil diimpor: ${successCount + ippnuSuccessCount}`);
    console.log(`Total data gagal: ${failCount + ippnuFailCount}`);
    
  } catch (error) {
    console.error('❌ Error dalam proses import:', error);
  }
}

// Jalankan script
importKaderisasiData();
