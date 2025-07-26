const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function convertExcelToJson(filePath, outputDir) {
  try {
    console.log(`🔄 Mengonversi file Excel: ${filePath}`);
    
    const workbook = XLSX.readFile(filePath);
    
    workbook.SheetNames.forEach(sheetName => {
      console.log(`   - Memproses sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      let jsonData;

      if (sheetName === 'REKAPITULASI') {
        jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      } else {
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      }
      
      const jsonFileName = `${sheetName.replace(/ /g, '_')}.json`;
      const outputFilePath = path.join(outputDir, jsonFileName);
      
      fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2));
      console.log(`   ✅ Berhasil disimpan ke: ${outputFilePath}`);
    });

    console.log('🎉 Konversi selesai.');

  } catch (error) {
    console.error('💥 Error saat mengonversi file:', error.message);
  }
}

if (require.main === module) {
  const filePath = process.argv[2];
  const outputDir = process.argv[3] || '.';
  
  if (!filePath) {
    console.log('❌ Harap berikan path file Excel');
    console.log('Contoh: node scripts/convert-excel-to-json.js path/to/file.xlsx [output_directory]');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File tidak ditemukan: ${filePath}`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  convertExcelToJson(filePath, outputDir);
}

module.exports = { convertExcelToJson };
