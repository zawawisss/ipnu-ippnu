# 📊 Import Data Kaderisasi Excel ke MongoDB

Dokumentasi lengkap untuk mengimport data kaderisasi dari file Excel ke MongoDB menggunakan Mongoose.

## 🎯 Fitur

- ✅ **Import data Excel** ke MongoDB
- ✅ **Validasi dan mapping data** otomatis
- ✅ **Deteksi duplikasi** berdasarkan nama & komisariat
- ✅ **Statistik lengkap** hasil import
- ✅ **Export data** kembali ke Excel
- ✅ **Manajemen data** (view, clear, stats)
- ✅ **Generate sample data** untuk testing

## 📁 Struktur File

```
scripts/
├── import-kaderisasi.js      # Script utama untuk import
├── create-sample-data.js     # Generate file Excel sample
├── manage-kaderisasi.js      # Manajemen data (stats, export, clear)
sample-data-kaderisasi.xlsx   # File Excel sample (auto-generated)
```

## 🚀 Quick Start

### 1. Buat File Excel Sample

```bash
cd /Users/awi/ipnu-ippnu-3
node scripts/create-sample-data.js
```

Output:
```
✅ File Excel sample berhasil dibuat!
📁 Lokasi: /Users/awi/ipnu-ippnu-3/sample-data-kaderisasi.xlsx
📊 Jumlah data: 10 baris
```

### 2. Import Data ke MongoDB

```bash
node scripts/import-kaderisasi.js sample-data-kaderisasi.xlsx
```

Output:
```
🔄 Memulai import data kaderisasi...
✅ Berhasil terhubung ke MongoDB
📖 Membaca file Excel: sample-data-kaderisasi.xlsx
📊 Ditemukan 10 baris data
✅ Berhasil import 10 data...

📋 LAPORAN IMPORT:
✅ Berhasil: 10 data
❌ Gagal: 0 data

📊 STATISTIK DATA:
IPNU: Total: 5, Aktif: 4, PKD: 2, PKL: 1, PKN: 2
IPPNU: Total: 5, Aktif: 2, PKD: 3, PKL: 2, PKN: 0
```

### 3. Lihat Statistik Data

```bash
node scripts/manage-kaderisasi.js stats
```

### 4. Lihat Data Terbaru

```bash
node scripts/manage-kaderisasi.js latest 5
```

## 📊 Format Excel

### Kolom yang Didukung

| Kolom | Wajib | Keterangan | Contoh |
|-------|-------|------------|--------|
| `nama` | ✅ | Nama lengkap kader | Ahmad Fauzi |
| `nim` | ❌ | Nomor Induk Mahasiswa | 2021001001 |
| `komisariat` | ✅ | Nama sekolah/komisariat | SMK Negeri 1 Ponorogo |
| `kecamatan` | ✅ | Kecamatan | Ponorogo |
| `desa` | ✅ | Desa/Kelurahan | Tonatan |
| `jenjang` | ✅ | PKD/PKL/PKN | PKD |
| `status` | ❌ | Status kader | Aktif |
| `tanggal_mulai` | ✅ | Tanggal mulai training | 2024-01-15 |
| `tanggal_selesai` | ❌ | Tanggal selesai training | 2024-03-15 |
| `mentor` | ✅ | Nama mentor/pembimbing | Ustadz Abdullah |
| `materi` | ❌ | Materi yang diselesaikan | Sejarah IPNU, Kepemimpinan |
| `nilai` | ❌ | Nilai akhir (0-100) | 85 |
| `sertifikat` | ❌ | Ya/Tidak/True/False | Ya |
| `catatan` | ❌ | Catatan tambahan | Peserta aktif |
| `organisasi` | ✅ | IPNU/IPPNU | IPNU |

### Mapping Otomatis

Script akan secara otomatis memetakan berbagai variasi nama kolom:

**Jenjang Kader:**
- `PKD` → Pelatihan Kader Dasar
- `PKL` → Pelatihan Kader Lanjutan  
- `PKN` → Pelatihan Kader Nasional

**Status:**
- `Aktif` → Kader aktif
- `Alumni` → Sudah lulus
- `Tidak Aktif` → Tidak aktif

**Organisasi:**
- `IPNU` → Ikatan Pelajar Nahdlatul Ulama
- `IPPNU` → Ikatan Pelajar Putri Nahdlatul Ulama

## 🛠️ Commands

### Import Data

```bash
# Import dari file Excel
node scripts/import-kaderisasi.js path/to/file.xlsx

# Contoh dengan file sample
node scripts/import-kaderisasi.js sample-data-kaderisasi.xlsx
```

### Manajemen Data

```bash
# Lihat semua command
node scripts/manage-kaderisasi.js

# Statistik data
node scripts/manage-kaderisasi.js stats

# Data terbaru (default: 10)
node scripts/manage-kaderisasi.js latest
node scripts/manage-kaderisasi.js latest 5

# Export ke Excel
node scripts/manage-kaderisasi.js export

# Hapus semua data (HATI-HATI!)
node scripts/manage-kaderisasi.js clear
```

### Generate Sample Data

```bash
# Buat file Excel sample dengan 10 data
node scripts/create-sample-data.js
```

## ⚙️ Konfigurasi

### Environment Variables

Pastikan file `.env.local` berisi:

```env
MONGODB_URI=mongodb://localhost:27017/your-database
# atau untuk MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Dependencies

Script menggunakan package:
- `mongoose` - MongoDB ODM
- `xlsx` - Excel file processing
- `dotenv` - Environment variables

Install dengan:
```bash
pnpm add mongoose xlsx dotenv
```

## 🔍 Validasi Data

### Validasi Wajib
- Nama harus diisi
- Komisariat harus diisi
- Kecamatan harus diisi
- Desa harus diisi
- Tanggal mulai harus valid
- Mentor harus diisi
- Organisasi harus IPNU/IPPNU

### Validasi Otomatis
- Jenjang kader: PKD/PKL/PKN
- Status kader: Aktif/Tidak Aktif/Alumni
- Nilai akhir: 0-100
- Format tanggal: YYYY-MM-DD atau Excel date

### Anti-Duplikasi
- Cek berdasarkan: nama + komisariat + organisasi
- Data duplikat akan dilewati
- Laporan mencatat jumlah data yang dilewati

## 📈 Output & Laporan

### Laporan Import
```
📋 LAPORAN IMPORT:
✅ Berhasil: 8 data
❌ Gagal: 2 data
⚠️  Duplikat: 1 data

🚨 Detail Error:
   - Baris 3: Nama harus diisi
   - Baris 7: Tanggal mulai tidak valid
```

### Statistik Database
```
📊 STATISTIK DATA:
IPNU: Total: 5, Aktif: 4, PKD: 2, PKL: 1, PKN: 2
IPPNU: Total: 5, Aktif: 2, PKD: 3, PKL: 2, PKN: 0

🏫 TOP 5 KOMISARIAT:
   1. SMK Negeri 1 Ponorogo (IPNU): 3 kader
   2. MA Negeri 1 Ponorogo (IPPNU): 2 kader

👨‍🏫 TOP 5 MENTOR:
   1. Ustadz Abdullah (IPNU): 2 kader
   2. Ustadzah Khadijah (IPPNU): 2 kader
```

## 🚨 Troubleshooting

### Error: MongoDB Connection
```bash
# Pastikan MongoDB running
brew services start mongodb-community

# Atau cek connection string di .env.local
MONGODB_URI=mongodb://localhost:27017/your-database
```

### Error: File Not Found
```bash
# Pastikan path file benar
node scripts/import-kaderisasi.js /full/path/to/file.xlsx

# Atau copy file ke root project
cp /path/to/file.xlsx ./data-kaderisasi.xlsx
node scripts/import-kaderisasi.js data-kaderisasi.xlsx
```

### Error: XLSX Module
```bash
# Install dependency yang kurang
pnpm add xlsx

# Atau install semua
pnpm install
```

## 🔄 Workflow Import

1. **Persiapan Data Excel**
   - Pastikan kolom sesuai format
   - Isi minimal field wajib
   - Simpan sebagai .xlsx

2. **Test dengan Sample**
   ```bash
   node scripts/create-sample-data.js
   node scripts/import-kaderisasi.js sample-data-kaderisasi.xlsx
   ```

3. **Import Data Asli**
   ```bash
   node scripts/import-kaderisasi.js your-data.xlsx
   ```

4. **Verifikasi Hasil**
   ```bash
   node scripts/manage-kaderisasi.js stats
   node scripts/manage-kaderisasi.js latest
   ```

5. **Backup Data** (opsional)
   ```bash
   node scripts/manage-kaderisasi.js export
   ```

## 📝 Tips & Best Practices

### Persiapan Excel
- Gunakan format tanggal: YYYY-MM-DD (2024-01-15)
- Konsisten dengan nama kolom
- Hindari merge cells
- Bersihkan data dari spasi berlebih

### Import Besar
- Import dalam batch kecil (100-500 baris)
- Monitor memory usage
- Backup database sebelum import besar

### Validasi Data
- Test dengan file sample terlebih dahulu
- Periksa laporan error sebelum import besar
- Validasi data manual untuk field penting

### Maintenance
- Export backup secara berkala
- Monitor statistik data
- Clean up data duplikat

## 🎯 Contoh Use Case

### Scenario 1: Import Data Awal
```bash
# 1. Buat template Excel
node scripts/create-sample-data.js

# 2. Edit sample-data-kaderisasi.xlsx dengan data asli
# 3. Import data
node scripts/import-kaderisasi.js sample-data-kaderisasi.xlsx

# 4. Verifikasi
node scripts/manage-kaderisasi.js stats
```

### Scenario 2: Update Data Berkala
```bash
# 1. Export data existing
node scripts/manage-kaderisasi.js export

# 2. Update file Excel dengan data baru
# 3. Import (duplikat akan dilewati)
node scripts/import-kaderisasi.js update-data.xlsx

# 4. Cek perubahan
node scripts/manage-kaderisasi.js latest 20
```

### Scenario 3: Migration Data
```bash
# 1. Backup data lama
node scripts/manage-kaderisasi.js export

# 2. Clear database
node scripts/manage-kaderisasi.js clear

# 3. Import data baru
node scripts/import-kaderisasi.js new-data.xlsx

# 4. Verifikasi
node scripts/manage-kaderisasi.js stats
```

---

✅ **Data kaderisasi siap digunakan di aplikasi web!**

Setelah import berhasil, data akan langsung tersedia di:
- `http://localhost:3001/admin_ipnu/kaderisasi`
- `http://localhost:3001/admin_ippnu/kaderisasi`
