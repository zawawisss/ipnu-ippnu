import fs from 'fs';
import path from 'path';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { toHijri } from 'hijri-converter';
import { format } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest and NextResponse

export function POST(req: NextRequest): Promise<NextResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        assignees,
        mengikuti_kegiatan,
        diselenggarakan_oleh,
        tempat_kegiatan,
        tanggal_kegiatan,
      } = await req.json();

      // Generate nomor surat otomatis
      // Format: nomorUrut/PC/ST/XXXI/73/{bulanRomawi}/{tahun2Digit}
      // Fetch the next global sequence number from the arsipkeluar API
      const nextSequenceResponse = await fetch(
        new URL('/api/arsipkeluar?getNextSequence=true', req.url),
        { headers: req.headers } // Use getNextSequence parameter
      );
      const sequenceData = await nextSequenceResponse.json();
      const nomorUrut = sequenceData.nextNumber.toString().padStart(3, '0'); // Format to 3 digits

      const tingkat = 'PC'; // Cabang
      const kodeSurat = 'ST'; // Surat Tugas
      const periodisasi = 'XXXI';
      const tahunKelahiran = '7354';
      const bulanRomawiArr = [
        'I',
        'II',
        'III',
        'IV',
        'V',
        'VI',
        'VII',
        'VIII',
        'IX',
        'X',
        'XI',
        'XII',
      ];
      const now = new Date();
      const bulanRomawi = bulanRomawiArr[now.getMonth()];
      const tahun2Digit = now.getFullYear().toString().slice(-2);
      const nomorSuratOtomatis = `${nomorUrut}/${tingkat}/${kodeSurat}/${periodisasi}/${tahunKelahiran}/${bulanRomawi}/${tahun2Digit}`;

      // Load the template file
      const templatePath = path.join(
        process.cwd(),
        'src/app/template/SuratTugasTemplateIPNU.docx'
      );
      const templateContent = fs.readFileSync(templatePath, 'binary');

      const zip = new PizZip(templateContent);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Replace placeholders with actual data
      const processedAssignees = assignees.map(
        (
          assignee: {
            nama: string;
            tempatTanggalLahir: string;
            jabatan: string;
            alamat: string;
          },
          index: number
        ) => {
          const result: {
            nama: string;
            tempatTanggalLahir: string;
            jabatan: string;
            alamat: string;
            assigneeIndex?: number;
          } = {
            nama: assignee.nama || '',
            tempatTanggalLahir: assignee.tempatTanggalLahir || '',
            jabatan: assignee.jabatan || '',
            alamat: assignee.alamat || '',
          };

          if (assignees.length > 1) {
            result.assigneeIndex = index + 1;
          } else {
            delete result.assigneeIndex; // Remove assigneeIndex for single assignee
          }

          return result;
        }
      );

      // Get current date
      // Format Masehi date (e.g., 20 Mei 2025)
      const bulan = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ];
      const tanggal_masehi = `${now.getDate()} ${
        bulan[now.getMonth()]
      } ${now.getFullYear()}`;
      // Format Hijriah date
      const hijri = toHijri(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate()
      );
      const bulan_hijriah = [
        'Muharram',
        'Safar',
        'Rabiul Awal',
        'Rabiul Akhir',
        'Jumadil Awal',
        'Jumadil Akhir',
        'Rajab',
        'Syaban',
        'Ramadhan',
        'Syawwal',
        'Dzulqaidah',
        'Dzulhijjah',
      ];
      const tanggal_hijriah = `${hijri.hd} ${bulan_hijriah[hijri.hm - 1]} ${
        hijri.hy
      }`;

      doc.render({
        nomor_surat: nomorSuratOtomatis,
        assignees: processedAssignees,
        mengikuti_kegiatan,
        diselenggarakan_oleh,
        tempat_kegiatan,
        tanggal_kegiatan,
        tanggal_hijriah: tanggal_hijriah,
        tanggal_masehi: tanggal_masehi,
      });

      const buffer = doc.getZip().generate({ type: 'nodebuffer' });

      // Save the generated file temporarily
      const sanitizedNomorSurat = nomorSuratOtomatis.replace(/\//g, '-');

      const outputPath = path.join(
        process.cwd(),
        'public',
        `SuratTugas-${sanitizedNomorSurat}.docx`
      );
      fs.writeFileSync(outputPath, buffer);

      resolve(
        NextResponse.json({
          message: 'Surat berhasil dibuat',
          downloadUrl: `/SuratTugas-${sanitizedNomorSurat}.docx`,
        })
      );
    } catch (error) {
      console.error('Error generating surat:', error);
      resolve(
        NextResponse.json(
          { message: 'Internal server error' },
          {
            status: 500,
          }
        )
      );
    }
  });
}
