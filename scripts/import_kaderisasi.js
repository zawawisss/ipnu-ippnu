import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import fetch from 'node-fetch';

// Baca file Excel
const filePath = '/Users/awi/Documents/Dokumen_Organisasi/PC/Database Pengkaderan.xlsx';
const workbook = xlsx.readFile(filePath);

// Fungsi impor data
async function importData(sheetName, organization) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet ${sheetName} tidak ditemukan.`);

  const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  for (let row of data) {
    const payload = {
      nama: row.Nama || 'Peserta ' + Math.random().toString(36).substring(2, 7),
      komisariat: row.Komisariat || 'Umum',
      kecamatan: row.Kecamatan || 'Salah satu',
      desa: row.Desa || 'Satu desa',
      jenjangKader: 'PKD',
      statusKader: 'Aktif',
      tanggalMulai: new Date().toISOString(),
      mentor: row.Mentor || 'Mentor A',
      organization,
    };

    const response = await fetch('http://localhost:3000/api/kaderisasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Gagal menambahkan data: ${JSON.stringify(payload)}`);
    } else {
      console.log(`Berhasil menambahkan data: ${payload.nama}`);
    }
  }
}

(async () => {
  try {
    await importData('DATA KADERISASI IPNU', 'IPNU');
    await importData('DATA KADERISASI IPPNU', 'IPPNU');
    console.log('Semua data telah diimpor.
');
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  }
})();

