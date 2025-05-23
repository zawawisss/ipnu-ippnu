import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { toHijri } from "hijri-converter";
import db from "@/lib/db";
import KecamatanModel from "@/models/Kecamatan";

// Define interfaces matching the data structure from the form
interface SimpleListItem {
  nama: string;
}

interface Departemen {
  departemen: string;
  koordinator: string;
  anggota: SimpleListItem[];
}

interface Lembaga {
  lembaga: string;
  direktur: string;
  sekretaris_lembaga: string;
  anggota_lembaga: SimpleListItem[];
}

interface CbpDivision {
  kepala: string;
  anggota: SimpleListItem[];
}

interface Cbp {
  komandan: string;
  wakil_komandan: SimpleListItem[];
}

interface SuratPengesahanPayload {
  kecamatan: string;
  masa_khidmat: string;
  tanggal_konferancab: string;
  nomor_mwc: string;
  tanggal_berakhir: string;
  ketua: string;
  sekretaris: string;
  bendahara: string;
  kecamatan_upper: string;
  kecamatan_capitalize: string;
  ketua_upper: string;
  sekretaris_upper: string;
  ketua_capitalize: string;
  sekretaris_capitalize: string;

  pelindung: SimpleListItem[];
  pembina: SimpleListItem[];
  wakil_ketua: SimpleListItem[];
  wakil_sekretaris: SimpleListItem[];
  wakil_bendahara: SimpleListItem[];

  departemen: Departemen[];
  lembaga: Lembaga[];
  cbp: Cbp;
}

export async function POST(req: NextRequest) {
  try {
    const data: SuratPengesahanPayload = await req.json();

    // Ambil nomor urut otomatis dari arsipkeluar
    // Pastikan endpoint ini ada dan berfungsi
    let nomorUrut;
    try {
      const nextSequenceResponse = await fetch(
        new URL("/api/arsipkeluar?getNextSequence=true", req.url),
        { headers: req.headers }
      );

      // Check if the response is OK
      if (!nextSequenceResponse.ok) {
        const errorText = await nextSequenceResponse.text();
        console.error(
          `Error fetching sequence number: ${nextSequenceResponse.status} - ${errorText}`
        );
        return NextResponse.json(
          {
            error: `Failed to fetch sequence number from /api/arsipkeluar. Status: ${nextSequenceResponse.status}`,
          },
          { status: 500 }
        );
      }

      const sequenceData = await nextSequenceResponse.json();

      // Check if nextNumber exists and is a number
      if (typeof sequenceData.nextNumber !== "number") {
        console.error(
          "Invalid data received from /api/arsipkeluar:",
          sequenceData
        );
        return NextResponse.json(
          { error: "Invalid sequence data received from /api/arsipkeluar." },
          { status: 500 }
        );
      }

      nomorUrut = sequenceData.nextNumber.toString().padStart(3, "0");
    } catch (fetchError) {
      console.error("Exception while fetching sequence number:", fetchError);
      return NextResponse.json(
        {
          error: `Exception fetching sequence number from /api/arsipkeluar: ${
            fetchError instanceof Error
              ? fetchError.message
              : String(fetchError)
          }`,
        },
        { status: 500 }
      );
    }

    // Format nomor surat otomatis
    const tingkat = "PC";
    const kodeSurat = "SP"; // Surat Pengesahan
    const periodisasi = "XXXI"; // Hardcoded, consider making this dynamic if needed
    const tahunKelahiran = "7354"; // Hardcoded, consider making this dynamic if needed
    const bulanRomawiArr = [
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
    const now = new Date();
    const bulanRomawi = bulanRomawiArr[now.getMonth()];
    const tahun2Digit = now.getFullYear().toString().slice(-2);
    const nomorSuratOtomatis = `${nomorUrut}/${tingkat}/${kodeSurat}/${periodisasi}/${tahunKelahiran}/${bulanRomawi}/${tahun2Digit}`;

    // Path template
    const templatePath = path.join(
      process.cwd(),
      "src/app/template",
      "SuratPengesahanTemplateIPNUPAC.docx"
    );
    // Check if template file exists
    let content;
    try {
      content = await fs.readFile(templatePath, "binary");
    } catch (fileReadError) {
      console.error(
        "Error reading template file:",
        templatePath,
        fileReadError
      );
      return NextResponse.json(
        {
          error: `Failed to read template file: ${templatePath}. Please ensure the file exists.`,
        },
        { status: 500 }
      );
    }

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Format tanggal hijriah & masehi
    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const tanggal_masehi = `${now.getDate()} ${
      bulan[now.getMonth()]
    } ${now.getFullYear()}`;
    const hijri = toHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const bulan_hijriah = [
      "Muharram",
      "Safar",
      "Rabiul Awal",
      "Rabiul Akhir",
      "Jumadil Awal",
      "Jumadil Akhir",
      "Rajab",
      "Syaban",
      "Ramadhan",
      "Syawwal",
      "Dzulqaidah",
      "Dzulhijjah",
    ];
    const tanggal_hijriah = `${hijri.hd} ${bulan_hijriah[hijri.hm - 1]} ${
      hijri.hy
    }`;

    // Helper to format date string to "DD Month BBBB"
    function formatTanggalIndonesia(dateStr: string): string {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string provided:", dateStr);
        return dateStr; // Return original string or a placeholder if invalid
      }
      const tgl = date.getDate().toString().padStart(2, "0");
      const bln = bulan[date.getMonth()];
      const thn = date.getFullYear();
      return `${tgl} ${bln} ${thn}`;
    }
    const tanggal_konferancab_fmt = formatTanggalIndonesia(
      data.tanggal_konferancab
    );
    const tanggal_berakhir_fmt = formatTanggalIndonesia(data.tanggal_berakhir);

    // Prepare data for rendering
    // Format list items with index and name for the template
    const renderData = {
      nomor_surat: nomorSuratOtomatis,
      kecamatan: data.kecamatan,
      kecamatan_upper: data.kecamatan_upper,
      kecamatan_capitalize: data.kecamatan_capitalize,
      masa_khidmat: data.masa_khidmat,
      tanggal_konferancab: tanggal_konferancab_fmt,
      nomor_mwc: data.nomor_mwc,
      tanggal_berakhir: tanggal_berakhir_fmt,
      tanggal_hijriah: tanggal_hijriah,
      tanggal_masehi: tanggal_masehi,

      ketua: data.ketua,
      sekretaris: data.sekretaris,
      bendahara: data.bendahara,
      ketua_upper: data.ketua_upper,
      sekretaris_upper: data.sekretaris_upper,
      ketua_capitalize: data.ketua_capitalize,
      sekretaris_capitalize: data.sekretaris_capitalize,

      // List yang menggunakan formatted_item
      pelindung: data.pelindung
        .filter((item) => item.nama.trim() !== "")
        .map((item, index) => ({
          formatted_item: `${index + 1}. ${item.nama}\n`,
        })),
      pembina: data.pembina
        .filter((item) => item.nama.trim() !== "")
        .map((item, index) => ({
          formatted_item: `${index + 1}. ${item.nama}\n`,
        })),
      wakil_ketua: data.wakil_ketua.filter((item) => item.nama.trim() !== ""),
      wakil_sekretaris: data.wakil_sekretaris.filter(
        (item) => item.nama.trim() !== ""
      ),
      wakil_bendahara: data.wakil_bendahara.filter(
        (item) => item.nama.trim() !== ""
      ),

      // Departemen dan lembaga: anggota menggunakan formatted_anggota
      departemen: data.departemen
        .filter(
          (dep) =>
            dep.departemen.trim() !== "" ||
            dep.koordinator.trim() !== "" ||
            dep.anggota.some((a) => a.nama.trim() !== "")
        )
        .map((dep) => ({
          departemen: dep.departemen,
          koordinator: dep.koordinator,
          anggota: dep.anggota
            .filter((a) => a.nama.trim() !== "")
            .map((a) => ({
              nama: a.nama + "\n",
            })),
        })),
      lembaga: data.lembaga
        .filter(
          (lem) =>
            lem.lembaga.trim() !== "" ||
            lem.direktur.trim() !== "" ||
            lem.sekretaris_lembaga.trim() !== "" ||
            lem.anggota_lembaga.some((a) => a.nama.trim() !== "")
        )
        .map((lem) => ({
          lembaga: lem.lembaga,
          direktur: lem.direktur,
          sekretaris_lembaga: lem.sekretaris_lembaga,
          anggota_lembaga: lem.anggota_lembaga
            .filter((a) => a.nama.trim() !== "")
            .map((a) => ({
              nama: a.nama + "\n",
            })),
        })),

      // CBP: nama divisi diinput manual, looping seperti lembaga, hanya divisi yang diisi saja yang dikirim
      cbp: Array.isArray((data.cbp as any)?.divisi)
        ? [
            {
              komandan: data.cbp.komandan,
              wakil_komandan: (data.cbp as any).wakil_komandan
                .filter(
                  (wakil_komandan: any) =>
                    wakil_komandan &&
                    (Array.isArray(wakil_komandan.nama_wakil_komandan)
                      ? wakil_komandan.nama_wakil_komandan.some(
                          (a: any) => a.nama && a.nama.trim() !== ""
                        )
                      : false)
                )
                .map((wakil_komandan: any) => ({
                  nama_wakil_komandan: Array.isArray(
                    wakil_komandan.nama_wakil_komandan
                  )
                    ? wakil_komandan.nama_wakil_komandan
                        .filter((a: any) => a.nama && a.nama.trim() !== "")
                        .map((a: any) => ({
                          nama: a.nama + "\n",
                        }))
                    : [],
                })),
              divisi: (data.cbp as any).divisi
                .filter(
                  (div: any) =>
                    div &&
                    ((div.divisi && div.divisi.trim() !== "") ||
                      (div.kepala && div.kepala.trim() !== "") ||
                      (Array.isArray(div.anggota_divisi) &&
                        div.anggota_divisi.some(
                          (a: any) => a.nama && a.nama.trim() !== ""
                        )))
                )
                .map((div: any) => ({
                  divisi: div.divisi || "",
                  kepala: div.kepala || "",
                  anggota_divisi: Array.isArray(div.anggota_divisi)
                    ? div.anggota_divisi
                        .filter((a: any) => a.nama && a.nama.trim() !== "")
                        .map((a: any) => ({
                          nama: a.nama + "\n",
                        }))
                    : [],
                })),
            },
          ].filter(
            (cbpItem) =>
              (cbpItem.komandan && cbpItem.komandan.trim() !== "") ||
              (Array.isArray(cbpItem.wakil_komandan) &&
                cbpItem.wakil_komandan.length > 0) ||
              (Array.isArray(cbpItem.divisi) && cbpItem.divisi.length > 0)
          )
        : [],
    };

    doc.render(renderData);
    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    // Simpan file ke public
    const sanitizedNomorSurat = nomorSuratOtomatis.replace(/\//g, "-");
    const outputPath = path.join(
      process.cwd(),
      "public",
      `SuratPengesahan-${sanitizedNomorSurat}.docx`
    );
    await fs.writeFile(outputPath, buf);

    // Update tanggal_berakhir dan nomor_sp di MongoDB
    try {
      await db();
      const updated = await KecamatanModel.findOneAndUpdate(
        { kecamatan: new RegExp(`^${data.kecamatan}$`, "i") }, // case-insensitive
        {
          tanggal_berakhir: data.tanggal_berakhir,
          nomor_sp: nomorSuratOtomatis,
        },
        { new: true, upsert: false }
      );
      if (!updated) {
        console.error("Kecamatan not found or not updated:", data.kecamatan);
      }
    } catch (updateErr) {
      console.error("Error updating MongoDB:", updateErr);
    }

    // Kembalikan link download
    return NextResponse.json({
      message: "Surat berhasil dibuat",
      downloadUrl: `/SuratPengesahan-${sanitizedNomorSurat}.docx`,
      nomor_surat: nomorSuratOtomatis,
    });
  } catch (error) {
    // Generic catch block for any other unexpected errors
    console.error("Unexpected error generating document:", error);
    return NextResponse.json(
      {
        error: `An unexpected error occurred: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
