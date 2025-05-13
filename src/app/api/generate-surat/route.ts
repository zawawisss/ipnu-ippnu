//api/generate-surat/route.ts
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { gregorianToHijri } from "@tabby_ai/hijri-converter";
import LetterSequence from "@/models/LetterSequence";

type DateType = {
  year: number;
  month: number;
  day: number;
};

interface Assignee {
  nama: string;
  tempatTanggalLahir: string;
  jabatan: string;
  alamat: string;
}

interface RequestBody {
  assignees: Assignee[];
  kegiatan: string;
  penyelenggara: string;
  tempat: string;
  tanggalKegiatan: string;
}


function toRoman(num: number) {
  const roman = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];
  return roman[num - 1];
}

function generateNomorSurat({
  urut,
  tingkatan = "PC",
  kodeSurat = "ST",
  periodisasi = "XXXI",
  tanggal = new Date(),
}: {
  urut: number;
  tingkatan?: string;
  kodeSurat?: string;
  periodisasi?: string;
  tanggal?: Date;
}) {
  const nomorUrut = String(urut).padStart(3, "0");
  const bulanRomawi = toRoman(tanggal.getMonth() + 1);
  const tahunSurat = String(tanggal.getFullYear()).slice(-2);
  const tahunLahirIPNU = "7354";

  return `${nomorUrut}/${tingkatan}/${kodeSurat}/${periodisasi}/${tahunLahirIPNU}/${bulanRomawi}/${tahunSurat}`;
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const data: RequestBody = await request.json();
    console.error("Received data:", data);

    if (!data || !data.assignees || data.assignees.length === 0) {
      console.error("Received data is empty or null, or assignees array is empty.");
      return NextResponse.json(
        { error: "Received data is empty or null, or assignees array is empty." },
        { status: 400 }
      );
    }

    const content = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "src/app/template/SuratTugasTemplateIPNU.docx"
      ),
      "binary"
    );
    console.error("Template file read successfully.");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    console.error("Docxtemplater instance created.");

    // Konversi tanggal hijriyah menggunakan library hijri-converter
    const tanggalSekarang = new Date();
    const gregorianDate: DateType = {
      year: tanggalSekarang.getFullYear(),
      month: tanggalSekarang.getMonth() + 1, // Month is 0-indexed in Date object
      day: tanggalSekarang.getDate(),
    };
    const hijriDateObj = gregorianToHijri(gregorianDate);

    const hijriMonths = [
      "Muharram",
      "Safar",
      "Rabiul Awal",
      "Rabiul Akhir",
      "Jumadil Awal",
      "Jumadil Akhir",
      "Rajab",
      "Sya'ban",
      "Ramadhan",
      "Syawal",
      "Dzulqa'dah",
      "Dzulhijjah",
    ];
    const hijriDate = `${hijriDateObj.day} ${
      hijriMonths[hijriDateObj.month - 1]
    } ${hijriDateObj.year} H`;

    // Get the next sequential number for Surat Tugas from the database
    const suratTugasSequence = await LetterSequence.findOneAndUpdate(
      { letterType: "SuratTugas" }, // Assuming 'SuratTugas' is the letterType for this surat
      { $inc: { lastSequenceNumber: 1 } },
      { new: true, upsert: true } // Create if not exists, return new document
    );

    const urutanTerakhir = suratTugasSequence.lastSequenceNumber;

    const nomorSurat = generateNomorSurat({
      urut: urutanTerakhir,
      tanggal: tanggalSekarang,
    });

    const assigneesWithIndex = data.assignees.map((assignee, index) => ({
      ...assignee,
      assigneeIndex: index + 1, // Add 1-based index to each assignee object
    }));

    doc.setData({
      assignees: assigneesWithIndex,
      mengikuti_kegiatan: data.kegiatan,
      diselenggarakan_oleh: data.penyelenggara,
      tempat_kegiatan: data.tempat,
      tanggal_kegiatan: data.tanggalKegiatan,
      tanggal_masehi: format(tanggalSekarang, "d MMMM yyyy", { locale: id }),
      tanggal_hijriah: hijriDate,
      nomor_surat: nomorSurat,
    });

    console.error("Attempting to render document.");
    try {
      doc.render();
    } catch (renderError: any) {
      console.error("Error during rendering:", renderError);
      return NextResponse.json(
        { error: `Rendering error: ${renderError.message}` },
        { status: 500 }
      );
    }

    const buf = doc.getZip().generate({ type: "nodebuffer" });

    return new NextResponse(buf, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": "attachment; filename=SuratTugas.docx",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
