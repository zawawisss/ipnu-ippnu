const XLSX = require('xlsx');
const path = require('path');

function analyzeExcel(filePath) {
  try {
    console.log('🔍 Menganalisis struktur file Excel...');
    console.log(`📁 File: ${filePath}`);

    // Baca file Excel
    const workbook = XLSX.readFile(filePath);
    
    console.log('\n📋 SHEET YANG TERSEDIA:');
    workbook.SheetNames.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });

    // Analisis setiap sheet
    workbook.SheetNames.forEach((sheetName, sheetIndex) => {
      console.log(`\n📊 ANALISIS SHEET: "${sheetName}"`);
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Dapatkan range data
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      console.log(`   📐 Range: ${worksheet['!ref'] || 'A1:A1'}`);
      console.log(`   📏 Ukuran: ${range.e.r + 1} baris × ${range.e.c + 1} kolom`);
      
      // Konversi ke JSON untuk analisis
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log('\n📝 PREVIEW DATA (10 baris pertama):');
      jsonData.slice(0, 10).forEach((row, index) => {
        if (row.length > 0) {
          console.log(`   Baris ${index + 1}: [${row.length} kolom] ${JSON.stringify(row).substring(0, 100)}${row.length > 3 ? '...' : ''}`);
        }
      });

      // Analisis struktur kolom
      console.log('\n🔍 ANALISIS STRUKTUR:');
      if (jsonData.length > 0) {
        // Cari baris header yang potensial
        let headerRowIndex = -1;
        let maxCols = 0;
        
        for (let i = 0; i < Math.min(20, jsonData.length); i++) {
          if (jsonData[i] && jsonData[i].length > maxCols) {
            maxCols = jsonData[i].length;
            headerRowIndex = i;
          }
        }
        
        if (headerRowIndex >= 0 && maxCols > 1) {
          console.log(`   🎯 Kemungkinan header di baris ${headerRowIndex + 1}:`);
          const headers = jsonData[headerRowIndex];
          headers.forEach((header, index) => {
            if (header && header.toString().trim()) {
              console.log(`      Kolom ${index + 1}: "${header}"`);
            }
          });
          
          // Analisis data setelah header
          if (headerRowIndex + 1 < jsonData.length) {
            console.log('\n📊 CONTOH DATA (5 baris setelah header):');
            const dataRows = jsonData.slice(headerRowIndex + 1, headerRowIndex + 6);
            dataRows.forEach((row, index) => {
              if (row && row.length > 0) {
                console.log(`   Data ${index + 1}: [${row.length} kolom]`);
                row.forEach((cell, colIndex) => {
                  if (cell !== undefined && cell !== null && cell.toString().trim()) {
                    const header = headers[colIndex] || `Col${colIndex + 1}`;
                    console.log(`      ${header}: "${cell}"`);
                  }
                });
                console.log('      ---');
              }
            });
          }
        } else {
          console.log('   ⚠️  Tidak ditemukan struktur tabel yang jelas');
          console.log('   💡 File mungkin berformat laporan atau memiliki struktur khusus');
        }
      }

      // Coba konversi dengan berbagai metode
      console.log('\n🔄 MENCOBA PARSING ALTERNATIF:');
      
      // Metode 1: Skip baris kosong
      const jsonDataSkipEmpty = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        blankrows: false 
      });
      console.log(`   Metode 1 (skip empty): ${jsonDataSkipEmpty.length} baris`);
      
      // Metode 2: Dengan header otomatis
      try {
        const jsonDataAutoHeader = XLSX.utils.sheet_to_json(worksheet);
        console.log(`   Metode 2 (auto header): ${jsonDataAutoHeader.length} baris`);
        if (jsonDataAutoHeader.length > 0) {
          console.log(`   Kolom terdeteksi: ${Object.keys(jsonDataAutoHeader[0]).join(', ')}`);
        }
      } catch (e) {
        console.log(`   Metode 2 gagal: ${e.message}`);
      }
      
      // Metode 3: Mulai dari baris tertentu
      for (let startRow = 1; startRow <= Math.min(10, jsonData.length); startRow++) {
        try {
          const jsonDataFromRow = XLSX.utils.sheet_to_json(worksheet, { range: startRow });
          if (jsonDataFromRow.length > 0 && Object.keys(jsonDataFromRow[0]).length > 3) {
            console.log(`   Metode 3 (mulai baris ${startRow + 1}): ${jsonDataFromRow.length} baris, ${Object.keys(jsonDataFromRow[0]).length} kolom`);
            console.log(`   Kolom: ${Object.keys(jsonDataFromRow[0]).join(', ')}`);
            break;
          }
        } catch (e) {
          // Ignore error
        }
      }
    });

  } catch (error) {
    console.error('💥 Error saat menganalisis file:', error.message);
  }
}

// Jalankan jika dipanggil langsung
if (require.main === module) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.log('❌ Harap berikan path file Excel');
    console.log('Contoh: node scripts/analyze-excel.js path/to/file.xlsx');
    process.exit(1);
  }

  if (!require('fs').existsSync(filePath)) {
    console.log('❌ File tidak ditemukan:', filePath);
    process.exit(1);
  }

  analyzeExcel(filePath);
}

module.exports = { analyzeExcel };
