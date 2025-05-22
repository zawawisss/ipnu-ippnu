"use client";
import { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
import axios from "axios";
import {
  Button,
  Input,
  Card,
  Autocomplete,
  AutocompleteItem,
  Textarea,
} from "@heroui/react";

// Definisikan antarmuka untuk struktur kompleks yang diharapkan
interface SimpleListItem {
  nama: string; // Untuk Pelindung, Pembina, Wakil Ketua, dll.
}

interface Departemen {
  departemen: string; // Nama departemen
  koordinator: string; // Nama koordinator
  anggota: SimpleListItem[]; // Array nama anggota
}

interface Lembaga {
  lembaga: string; // Nama lembaga
  direktur: string; // Nama direktur
  sekretaris_lembaga: string; // Nama sekretaris lembaga
  anggota_lembaga: SimpleListItem[]; // Array nama anggota lembaga
}

interface CbpDivisiManual {
  divisi: string;
  kepala: string;
  anggota_divisi: SimpleListItem[];
}

interface CbpManual {
  komandan: string;
  wakil_komandan: SimpleListItem[];
  divisi: CbpDivisiManual[];
}

// Perbarui antarmuka untuk mencerminkan data terstruktur daripada string JSON
export interface SuratPengesahanData {
  nomor_surat: string; // Dihasilkan oleh API
  kecamatan: string;
  masa_khidmat: string; // Diperoleh dari tanggal_konferancab
  tanggal_konferancab: string;
  nomor_mwc: string;
  tanggal_berakhir: string; // Diperoleh dari tanggal_konferancab
  tanggal_hijriah: string; // Dihasilkan oleh API
  tanggal_masehi: string; // Dihasilkan oleh API
  ketua: string; // Nama ketua dasar
  sekretaris: string; // Nama sekretaris dasar
  bendahara: string; // Nilai tunggal

  // Bidang turunan (dapat diturunkan di formulir atau API)
  kecamatan_upper: string;
  kecamatan_capitalize: string;
  ketua_upper: string; // Diperoleh dari ketua
  sekretaris_upper: string; // Diperoleh dari sekretaris
  ketua_capitalize: string; // Diperoleh dari ketua (asumsi template menggunakannya)
  sekretaris_capitalize: string; // Diperoleh dari sekretaris (asumsi template menggunakannya)

  // Bidang untuk daftar (dikelola sebagai array objek)
  pelindung: SimpleListItem[];
  pembina: SimpleListItem[];
  wakil_ketua: SimpleListItem[];
  wakil_sekretaris: SimpleListItem[];
  wakil_bendahara: SimpleListItem[];

  // Bidang untuk struktur kompleks (dikelola sebagai array/objek)
  departemen: Departemen[];
  lembaga: Lembaga[];
  cbp: CbpManual; // Ubah ke manual
}

export default function App() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<SuratPengesahanData>({
    nomor_surat: "",
    kecamatan: "",
    masa_khidmat: "",
    tanggal_konferancab: "",
    nomor_mwc: "",
    tanggal_berakhir: "",
    tanggal_hijriah: "",
    tanggal_masehi: "",
    ketua: "",
    sekretaris: "",
    bendahara: "",

    kecamatan_upper: "",
    kecamatan_capitalize: "",
    ketua_upper: "",
    sekretaris_upper: "",
    ketua_capitalize: "",
    sekretaris_capitalize: "",

    // Inisialisasi daftar dengan setidaknya satu item kosong atau array kosong
    pelindung: [{ nama: "" }],
    pembina: [{ nama: "" }],
    wakil_ketua: [{ nama: "" }],
    wakil_sekretaris: [{ nama: "" }],
    wakil_bendahara: [{ nama: "" }],

    // Inisialisasi struktur kompleks
    departemen: [{ departemen: "", koordinator: "", anggota: [{ nama: "" }] }],
    lembaga: [
      {
        lembaga: "",
        direktur: "",
        sekretaris_lembaga: "",
        anggota_lembaga: [{ nama: "" }],
      },
    ],
    cbp: {
      komandan: "",
      wakil_komandan: [{ nama: "" }],
      divisi: [{ divisi: "", kepala: "", anggota_divisi: [{ nama: "" }] }],
    },
  });
  const [loading, setLoading] = useState(false);
  const [kecamatanList, setKecamatanList] = useState<string[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [highlightedItem, setHighlightedItem] = useState<{ listName: string; index: number } | null>(null);


  // Ref untuk daftar sederhana (array ref untuk setiap daftar)
  const pelindungRefs = useRef<Array<HTMLInputElement | null>>([]);
  const pembinaRefs = useRef<Array<HTMLInputElement | null>>([]);
  const wakilKetuaRefs = useRef<Array<HTMLInputElement | null>>([]);
  const wakilSekretarisRefs = useRef<Array<HTMLInputElement | null>>([]);
  const wakilBendaharaRefs = useRef<Array<HTMLInputElement | null>>([]);
  const wakilKomandanRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Ref untuk daftar bersarang dinamis (array ref untuk setiap daftar)
  const anggotaDepartemenRefs = useRef<Array<HTMLInputElement | null>>([]);
  const anggotaLembagaRefs = useRef<Array<HTMLInputElement | null>>([]);
  const anggotaCbpDivisiRefs = useRef<Array<Array<HTMLInputElement | null>>>(
    []
  );

  useEffect(() => {
    // Ambil data kecamatan dari API
    const fetchKecamatan = async () => {
      try {
        const res = await fetch("/api/kecamatan?limit=100");
        const json = await res.json();
        if (json.data) {
          setKecamatanList(json.data.map((item: any) => item.kecamatan));
        }
      } catch (err) {
        console.error("Gagal mengambil daftar kecamatan:", err);
        setKecamatanList([]);
      }
    };
    fetchKecamatan();
  }, []);

  // Efek untuk menghapus pesan setelah beberapa detik
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000); // Pesan akan hilang setelah 5 detik
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Efek untuk menghapus highlight setelah beberapa detik
  useEffect(() => {
    if (highlightedItem) {
      const timer = setTimeout(() => {
        setHighlightedItem(null);
      }, 1000); // Highlight akan hilang setelah 1 detik
      return () => clearTimeout(timer);
    }
  }, [highlightedItem]);

  const capitalizeWords = (str: string) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // --- Handler Generik untuk Daftar Sederhana ---
  const handleSimpleListItemChange = (
    listName: keyof Pick<
      SuratPengesahanData,
      | "pelindung"
      | "pembina"
      | "wakil_ketua"
      | "wakil_sekretaris"
      | "wakil_bendahara"
    >,
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const updatedList = [...formData[listName]];
    updatedList[index].nama = value;
    setFormData((prev) => ({ ...prev, [listName]: updatedList }));
  };

  const addSimpleListItem = (
    listName: keyof Pick<
      SuratPengesahanData,
      | "pelindung"
      | "pembina"
      | "wakil_ketua"
      | "wakil_sekretaris"
      | "wakil_bendahara"
    >,
    refs: React.MutableRefObject<Array<HTMLInputElement | null>>
  ) => {
    setFormData((prev) => {
      const newList = [...prev[listName], { nama: "" }];
      setHighlightedItem({ listName, index: newList.length - 1 });
      return { ...prev, [listName]: newList };
    });
    setTimeout(() => {
      const newRef = refs.current[refs.current.length - 1];
      if (newRef) {
        newRef.focus();
        newRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  };

  const removeSimpleListItem = (
    listName: keyof Pick<
      SuratPengesahanData,
      | "pelindung"
      | "pembina"
      | "wakil_ketua"
      | "wakil_sekretaris"
      | "wakil_bendahara"
    >,
    index: number
  ) => {
    if (formData[listName].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [listName]: prev[listName].filter((_, i) => i !== index),
      }));
    } else {
      const updatedList = [...formData[listName]];
      updatedList[index].nama = "";
      setFormData((prev) => ({ ...prev, [listName]: updatedList }));
    }
  };

  // --- Handler untuk Departemen ---
  const handleDepartemenChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const updatedDepartemen = [...formData.departemen];
    updatedDepartemen[index] = {
      ...updatedDepartemen[index],
      [name as keyof Departemen]: value,
    };
    setFormData((prev) => ({ ...prev, departemen: updatedDepartemen }));
  };

  const handleDepartemenAnggotaChange = (
    departemenIndex: number,
    anggotaIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const updatedDepartemen = [...formData.departemen];
    updatedDepartemen[departemenIndex].anggota[anggotaIndex].nama = value;
    setFormData((prev) => ({ ...prev, departemen: updatedDepartemen }));
  };

  const addDepartemen = () => {
    setFormData((prev) => ({
      ...prev,
      departemen: [
        ...prev.departemen,
        { departemen: "", koordinator: "", anggota: [{ nama: "" }] },
      ],
    }));
  };

  const addDepartemenAnggota = (departemenIndex: number) => {
    setFormData((prev) => {
      const updatedDepartemen = [...prev.departemen];
      updatedDepartemen[departemenIndex].anggota.push({ nama: "" });
      setHighlightedItem({ listName: `departemenAnggota-${departemenIndex}`, index: updatedDepartemen[departemenIndex].anggota.length - 1 });
      return { ...prev, departemen: updatedDepartemen };
    });
    setTimeout(() => {
      const newRef = anggotaDepartemenRefs.current[departemenIndex * 100 + formData.departemen[departemenIndex].anggota.length];
      if (newRef) {
        newRef.focus();
        newRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  };

  const removeDepartemen = (index: number) => {
    if (formData.departemen.length > 1) {
      setFormData((prev) => ({
        ...prev,
        departemen: prev.departemen.filter((_, i) => i !== index),
      }));
    } else {
      const updatedDepartemen = [...formData.departemen];
      updatedDepartemen[index] = {
        departemen: "",
        koordinator: "",
        anggota: [{ nama: "" }],
      };
      setFormData((prev) => ({ ...prev, departemen: updatedDepartemen }));
    }
  };

  const removeDepartemenAnggota = (
    departemenIndex: number,
    anggotaIndex: number
  ) => {
    const updatedDepartemen = [...formData.departemen];
    if (updatedDepartemen[departemenIndex].anggota.length > 1) {
      updatedDepartemen[departemenIndex].anggota = updatedDepartemen[
        departemenIndex
      ].anggota.filter((_, i) => i !== anggotaIndex);
      setFormData((prev) => ({ ...prev, departemen: updatedDepartemen }));
    } else {
      updatedDepartemen[departemenIndex].anggota[anggotaIndex].nama = "";
      setFormData((prev) => ({ ...prev, departemen: updatedDepartemen }));
    }
  };

  // --- Handler untuk Lembaga ---
  const handleLembagaChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const updatedLembaga = [...formData.lembaga];
    updatedLembaga[index] = {
      ...updatedLembaga[index],
      [name as keyof Lembaga]: value,
    };
    setFormData((prev) => ({ ...prev, lembaga: updatedLembaga }));
  };

  const handleLembagaAnggotaChange = (
    lembagaIndex: number,
    anggotaIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const updatedLembaga = [...formData.lembaga];
    updatedLembaga[lembagaIndex].anggota_lembaga[anggotaIndex].nama = value;
    setFormData((prev) => ({ ...prev, lembaga: updatedLembaga }));
  };

  const addLembaga = () => {
    setFormData((prev) => ({
      ...prev,
      lembaga: [
        ...prev.lembaga,
        {
          lembaga: "",
          direktur: "",
          sekretaris_lembaga: "",
          anggota_lembaga: [{ nama: "" }],
        },
      ],
    }));
  };

  const addLembagaAnggota = (lembagaIndex: number) => {
    setFormData((prev) => {
      const updatedLembaga = [...prev.lembaga];
      updatedLembaga[lembagaIndex].anggota_lembaga.push({ nama: "" });
      setHighlightedItem({ listName: `lembagaAnggota-${lembagaIndex}`, index: updatedLembaga[lembagaIndex].anggota_lembaga.length - 1 });
      return { ...prev, lembaga: updatedLembaga };
    });
    setTimeout(() => {
      const newRef = anggotaLembagaRefs.current[lembagaIndex * 100 + formData.lembaga[lembagaIndex].anggota_lembaga.length];
      if (newRef) {
        newRef.focus();
        newRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  };

  const removeLembaga = (index: number) => {
    if (formData.lembaga.length > 1) {
      setFormData((prev) => ({
        ...prev,
        lembaga: prev.lembaga.filter((_, i) => i !== index),
      }));
    } else {
      const updatedLembaga = [...formData.lembaga];
      updatedLembaga[index] = {
        lembaga: "",
        direktur: "",
        sekretaris_lembaga: "",
        anggota_lembaga: [{ nama: "" }],
      };
      setFormData((prev) => ({ ...prev, lembaga: updatedLembaga }));
    }
  };

  const removeLembagaAnggota = (lembagaIndex: number, anggotaIndex: number) => {
    const updatedLembaga = [...formData.lembaga];
    if (updatedLembaga[lembagaIndex].anggota_lembaga.length > 1) {
      updatedLembaga[lembagaIndex].anggota_lembaga = updatedLembaga[
        lembagaIndex
      ].anggota_lembaga.filter((_, i) => i !== anggotaIndex);
      setFormData((prev) => ({ ...prev, lembaga: updatedLembaga }));
    } else {
      updatedLembaga[lembagaIndex].anggota_lembaga[anggotaIndex].nama = "";
      setFormData((prev) => ({ ...prev, lembaga: updatedLembaga }));
    }
  };

  // --- Handler untuk CBP manual divisi ---
  const handleCbpChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      cbp: {
        ...prev.cbp,
        [name]: value,
      },
    }));
  };

  const handleCbpSimpleListChange = (
    listName: keyof Pick<CbpManual, "wakil_komandan">,
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const updatedCbp = { ...formData.cbp };
    updatedCbp[listName][index].nama = value;
    setFormData((prev) => ({ ...prev, cbp: updatedCbp }));
  };

  const addCbpSimpleListItem = (
    listName: keyof Pick<CbpManual, "wakil_komandan">,
    refs: React.MutableRefObject<Array<HTMLInputElement | null>>
  ) => {
    setFormData((prev) => {
      const newList = [...prev.cbp[listName], { nama: "" }];
      setHighlightedItem({ listName: `cbp-${listName}`, index: newList.length - 1 });
      return {
        ...prev,
        cbp: {
          ...prev.cbp,
          [listName]: newList,
        },
      };
    });
    setTimeout(() => {
      const newRef = refs.current[refs.current.length - 1];
      if (newRef) {
        newRef.focus();
        newRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  };

  const removeCbpSimpleListItem = (
    listName: keyof Pick<CbpManual, "wakil_komandan">,
    index: number
  ) => {
    const updatedCbp = { ...formData.cbp };
    if (updatedCbp[listName].length > 1) {
      updatedCbp[listName] = updatedCbp[listName].filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, cbp: updatedCbp }));
    } else {
      updatedCbp[listName][index].nama = "";
      setFormData((prev) => ({ ...prev, cbp: updatedCbp }));
    }
  };

  const handleCbpDivisiChange = (
    divisiIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const updatedDivisi = [...formData.cbp.divisi];
    updatedDivisi[divisiIndex] = {
      ...updatedDivisi[divisiIndex],
      [name]: value,
    };
    setFormData((prev) => ({
      ...prev,
      cbp: { ...prev.cbp, divisi: updatedDivisi },
    }));
  };

  const handleCbpDivisiAnggotaChange = (
    divisiIndex: number,
    anggotaIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const updatedDivisi = [...formData.cbp.divisi];
    updatedDivisi[divisiIndex].anggota_divisi[anggotaIndex].nama = value;
    setFormData((prev) => ({
      ...prev,
      cbp: { ...prev.cbp, divisi: updatedDivisi },
    }));
  };

  const addCbpDivisi = () => {
    setFormData((prev) => ({
      ...prev,
      cbp: {
        ...prev.cbp,
        divisi: [
          ...prev.cbp.divisi,
          { divisi: "", kepala: "", anggota_divisi: [{ nama: "" }] },
        ],
      },
    }));
  };

  const removeCbpDivisi = (divisiIndex: number) => {
    if (formData.cbp.divisi.length > 1) {
      setFormData((prev) => ({
        ...prev,
        cbp: {
          ...prev.cbp,
          divisi: prev.cbp.divisi.filter((_, i) => i !== divisiIndex),
        },
      }));
    } else {
      const updatedDivisi = [...formData.cbp.divisi];
      updatedDivisi[divisiIndex] = {
        divisi: "",
        kepala: "",
        anggota_divisi: [{ nama: "" }],
      };
      setFormData((prev) => ({
        ...prev,
        cbp: { ...prev.cbp, divisi: updatedDivisi },
      }));
    }
  };

  const addCbpDivisiAnggota = (divisiIndex: number) => {
    setFormData((prev) => {
      const updatedDivisi = [...prev.cbp.divisi];
      updatedDivisi[divisiIndex].anggota_divisi.push({ nama: "" });
      setHighlightedItem({ listName: `cbpDivisiAnggota-${divisiIndex}`, index: updatedDivisi[divisiIndex].anggota_divisi.length - 1 });
      return {
        ...prev,
        cbp: { ...prev.cbp, divisi: updatedDivisi },
      };
    });
    setTimeout(() => {
      const newRef = anggotaCbpDivisiRefs.current[divisiIndex]?.[formData.cbp.divisi[divisiIndex].anggota_divisi.length];
      if (newRef) {
        newRef.focus();
        newRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  };

  const removeCbpDivisiAnggota = (
    divisiIndex: number,
    anggotaIndex: number
  ) => {
    const updatedDivisi = [...formData.cbp.divisi];
    if (updatedDivisi[divisiIndex].anggota_divisi.length > 1) {
      updatedDivisi[divisiIndex].anggota_divisi = updatedDivisi[
        divisiIndex
      ].anggota_divisi.filter((_, i) => i !== anggotaIndex);
      setFormData((prev) => ({
        ...prev,
        cbp: { ...prev.cbp, divisi: updatedDivisi },
      }));
    } else {
      updatedDivisi[divisiIndex].anggota_divisi[anggotaIndex].nama = "";
      setFormData((prev) => ({
        ...prev,
        cbp: { ...prev.cbp, divisi: updatedDivisi },
      }));
    }
  };

  // --- Handler Perubahan Input Umum ---
  const handleGeneralInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "tanggal_konferancab") {
      // Hitung tanggal berakhir 2 tahun setelah tanggal konferancab
      const startDate = new Date(value);
      const startYear = startDate.getFullYear();
      const endYear = startYear + 2;
      const newDate = new Date(value);
      newDate.setFullYear(newDate.getFullYear() + 2);
      const formattedEndDate = newDate.toISOString().slice(0, 10);
      // Set masa khidmat hanya sebagai tahun, contoh "2025 - 2027"
      const masaKhidmat = `${startYear} - ${endYear}`;
      setFormData((prev) => ({
        ...prev,
        tanggal_konferancab: value,
        tanggal_berakhir: formattedEndDate,
        masa_khidmat: masaKhidmat,
      }));
    } else if (name === "kecamatan") {
      setFormData((prev) => ({
        ...prev,
        kecamatan: value,
        kecamatan_upper: value.toUpperCase(),
        kecamatan_capitalize: capitalizeWords(value),
      }));
    } else if (name === "ketua") {
      setFormData((prev) => ({
        ...prev,
        ketua: value,
        ketua_upper: value.toUpperCase(),
        ketua_capitalize: capitalizeWords(value),
      }));
    } else if (name === "sekretaris") {
      setFormData((prev) => ({
        ...prev,
        sekretaris: value,
        sekretaris_upper: value.toUpperCase(),
        sekretaris_capitalize: capitalizeWords(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null); // Bersihkan pesan sebelumnya

    try {
      // Siapkan payload - formData sudah memiliki struktur yang benar
      // Filter item kosong dari daftar sebelum mengirim
      const payload = {
        ...formData,
        pelindung: formData.pelindung.filter((item) => item.nama.trim() !== ""),
        pembina: formData.pembina.filter((item) => item.nama.trim() !== ""),
        wakil_ketua: formData.wakil_ketua.filter(
          (item) => item.nama.trim() !== ""
        ),
        wakil_sekretaris: formData.wakil_sekretaris.filter(
          (item) => item.nama.trim() !== ""
        ),
        wakil_bendahara: formData.wakil_bendahara.filter(
          (item) => item.nama.trim() !== ""
        ),
        departemen: formData.departemen
          .filter(
            (dep) =>
              dep.departemen.trim() !== "" ||
              dep.koordinator.trim() !== "" ||
              dep.anggota.some((a) => a.nama.trim() !== "")
          )
          .map((dep) => ({
            ...dep,
            anggota: dep.anggota.filter((a) => a.nama.trim() !== ""),
          })),
        lembaga: formData.lembaga
          .filter(
            (lem) =>
              lem.lembaga.trim() !== "" ||
              lem.direktur.trim() !== "" ||
              lem.sekretaris_lembaga.trim() !== "" ||
              lem.anggota_lembaga.some((a) => a.nama.trim() !== "")
          )
          .map((lem) => ({
            ...lem,
            anggota_lembaga: lem.anggota_lembaga.filter(
              (a) => a.nama.trim() !== ""
            ),
          })),
        cbp: {
          komandan: formData.cbp.komandan,
          wakil_komandan: formData.cbp.wakil_komandan.filter(
            (item) => item.nama.trim() !== ""
          ),
          divisi: formData.cbp.divisi
            .filter(
              (div) =>
                div.divisi.trim() !== "" ||
                div.kepala.trim() !== "" ||
                div.anggota_divisi.some((a) => a.nama.trim() !== "")
            )
            .map((div) => ({
              divisi: div.divisi,
              kepala: div.kepala,
              anggota_divisi: div.anggota_divisi.filter(
                (a) => a.nama.trim() !== ""
              ),
            })),
        },
      };

      // Hapus nomor_surat karena dihasilkan oleh API
      delete (payload as any).nomor_surat;
      // Hapus bidang tanggal yang dihasilkan karena API akan menghasilkannya
      delete (payload as any).tanggal_hijriah;
      delete (payload as any).tanggal_masehi;

      const response = await axios.post(
        "/api/generateSuratPengesahan",
        payload
      );

      // Set nomor_surat dari respons agar tampil di formulir
      if (response.data && response.data.nomor_surat) {
        setFormData((prev) => ({
          ...prev,
          nomor_surat: response.data.nomor_surat,
        }));
      }
      // Unduh langsung
      window.location.href = response.data.downloadUrl;
      setMessage({ text: "Surat berhasil dibuat dan diunduh!", type: "success" });
    } catch (error) {
      console.error("Error generating document:", error);
      setMessage({ text: "Terjadi kesalahan saat membuat surat.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk merender ikon tempat sampah
  const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.924a2.25 2.25 0 01-2.244-2.077L4.74 5.69c-.32-.052-.65-.107-.98-.166M5.25 9V7.5A2.25 2.25 0 017.5 5.25h9A2.25 2.25 0 0119.5 7.5V9m-9-2.25h.008v.008H10.5V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );

  // Fungsi untuk merender ikon tambah
  const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      {/* Label header di atas semua isi formulir */}
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Formulir Surat Pengesahan</h1>

      {/* Area pesan */}
      {message && (
        <div
          className={`p-4 rounded-lg text-white ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Bagian Data Umum */}
      <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Data Umum</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              Kecamatan
            </label>
            <Autocomplete
              label=""
              placeholder="Ketik atau pilih kecamatan"
              selectedKey={formData.kecamatan}
              onSelectionChange={(key) => {
                const value = key as string;
                setFormData((prev) => ({
                  ...prev,
                  kecamatan: value,
                  kecamatan_upper: value.toUpperCase(),
                  kecamatan_capitalize: capitalizeWords(value),
                }));
              }}
              className="w-full"
              isClearable
              inputValue={formData.kecamatan}
              onInputChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  kecamatan: value,
                  kecamatan_upper: value.toUpperCase(),
                  kecamatan_capitalize: capitalizeWords(value),
                }));
              }}
              isDisabled={loading}
            >
              {kecamatanList.map((kec) => (
                <AutocompleteItem key={kec}>{kec}</AutocompleteItem>
              ))}
            </Autocomplete>
          </div>
          <div className="flex flex-col">
            <Input
              label="Masa Khidmat"
              name="masa_khidmat"
              value={formData.masa_khidmat}
              readOnly
              required
              description={
                formData.tanggal_konferancab
                  ? `Terisi: ${formData.masa_khidmat}`
                  : "Field ini terisi otomatis, silahkan isi tanggal konferancab."
              }
              className="text-base md:text-lg w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 cursor-not-allowed"
              isDisabled={loading}
            />
          </div>
          <Input
            label="Tanggal Konferancab"
            name="tanggal_konferancab"
            type="date"
            value={formData.tanggal_konferancab}
            onChange={handleGeneralInputChange}
            required
            className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            isDisabled={loading}
          />
          <Input
            label="Nomor MWC"
            name="nomor_mwc"
            value={formData.nomor_mwc}
            onChange={handleGeneralInputChange}
            required
            className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            isDisabled={loading}
          />
          <div className="flex flex-col">
            <Input
              label="Tanggal Berakhir"
              name="tanggal_berakhir"
              type="date"
              value={formData.tanggal_berakhir}
              readOnly
              required
              description={
                formData.tanggal_konferancab
                  ? `Terisi: ${formData.tanggal_berakhir}`
                  : "Field ini terisi otomatis, silahkan isi tanggal konferancab."
              }
              className="text-base md:text-lg w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
              isDisabled={loading}
            />
          </div>
          <Input
            label="Ketua"
            name="ketua"
            value={formData.ketua}
            onChange={handleGeneralInputChange}
            required
            className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            isDisabled={loading}
          />
          <Input
            label="Sekretaris"
            name="sekretaris"
            value={formData.sekretaris}
            onChange={handleGeneralInputChange}
            required
            className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            isDisabled={loading}
          />
          <Input
            label="Bendahara"
            name="bendahara"
            value={formData.bendahara}
            onChange={handleGeneralInputChange}
            required
            className="text-base md:text-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            isDisabled={loading}
          />
        </div>
      </Card>

      {/* Bagian Dinamis untuk Daftar Sederhana */}
      <details open> {/* Default terbuka */}
        <summary className="text-xl font-semibold mb-4 cursor-pointer py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-md flex justify-between items-center text-gray-900 dark:text-gray-100">
          Pelindung
          <span className="text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </summary>
        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-2">
          {formData.pelindung.length === 0 || (formData.pelindung.length === 1 && formData.pelindung[0].nama.trim() === "") ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tambahkan pelindung pertama Anda.</p>
          ) : null}
          {formData.pelindung.map((item, index) => (
            <div
              key={`pelindung-${index}`}
              className={`flex items-center gap-4 mb-2 ${
                highlightedItem?.listName === 'pelindung' && highlightedItem?.index === index
                  ? 'transition-all duration-300 bg-yellow-100 dark:bg-yellow-900 rounded-md p-2'
                  : ''
              }`}
            >
              <Input
                label={`Nama Pelindung ${index + 1}`}
                name="nama"
                value={item.nama}
                onChange={(e) =>
                  handleSimpleListItemChange("pelindung", index, e)
                }
                ref={(el) => {
                  pelindungRefs.current[index] = el;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSimpleListItem("pelindung", pelindungRefs);
                  }
                }}
                className="flex-grow text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                isDisabled={loading}
                description={index === formData.pelindung.length - 1 ? "Tekan Enter untuk menambah baris baru" : ""}
              />
              <Button
                type="button"
                color="danger"
                variant="flat"
                size="sm"
                onClick={() => removeSimpleListItem("pelindung", index)}
                isDisabled={
                  (formData.pelindung.length <= 1 && item.nama.trim() === "") || loading
                }
              >
                <TrashIcon /> Hapus
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => addSimpleListItem("pelindung", pelindungRefs)}
            color="secondary"
            variant="flat"
            className="text-base md:text-lg mt-4"
            isDisabled={loading}
          >
            <PlusIcon /> Tambah Pelindung
          </Button>
        </Card>
      </details>

      <details>
        <summary className="text-xl font-semibold mb-4 cursor-pointer py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-md flex justify-between items-center text-gray-900 dark:text-gray-100">
          Dewan Pembina
          <span className="text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </summary>
        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-2">
          {formData.pembina.length === 0 || (formData.pembina.length === 1 && formData.pembina[0].nama.trim() === "") ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tambahkan pembina pertama Anda.</p>
          ) : null}
          {formData.pembina.map((item, index) => (
            <div
              key={`pembina-${index}`}
              className={`flex items-center gap-4 mb-2 ${
                highlightedItem?.listName === 'pembina' && highlightedItem?.index === index
                  ? 'transition-all duration-300 bg-yellow-100 dark:bg-yellow-900 rounded-md p-2'
                  : ''
              }`}
            >
              <Input
                label={`Nama Pembina ${index + 1}`}
                name="nama"
                value={item.nama}
                onChange={(e) => handleSimpleListItemChange("pembina", index, e)}
                ref={(el) => {
                  pembinaRefs.current[index] = el;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSimpleListItem("pembina", pembinaRefs);
                  }
                }}
                className="flex-grow text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                isDisabled={loading}
                description={index === formData.pembina.length - 1 ? "Tekan Enter untuk menambah baris baru" : ""}
              />
              <Button
                type="button"
                color="danger"
                variant="flat"
                size="sm"
                onClick={() => removeSimpleListItem("pembina", index)}
                isDisabled={
                  (formData.pembina.length <= 1 && item.nama.trim() === "") || loading
                }
              >
                <TrashIcon /> Hapus
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => addSimpleListItem("pembina", pembinaRefs)}
            color="secondary"
            variant="flat"
            className="text-base md:text-lg mt-4"
            isDisabled={loading}
          >
            <PlusIcon /> Tambah Pembina
          </Button>
        </Card>
      </details>

      <details>
        <summary className="text-xl font-semibold mb-4 cursor-pointer py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-md flex justify-between items-center text-gray-900 dark:text-gray-100">
          Wakil Ketua
          <span className="text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </summary>
        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-2">
          {formData.wakil_ketua.length === 0 || (formData.wakil_ketua.length === 1 && formData.wakil_ketua[0].nama.trim() === "") ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tambahkan wakil ketua pertama Anda.</p>
          ) : null}
          {formData.wakil_ketua.map((item, index) => (
            <div
              key={`wakil_ketua-${index}`}
              className={`flex items-center gap-4 mb-2 ${
                highlightedItem?.listName === 'wakil_ketua' && highlightedItem?.index === index
                  ? 'transition-all duration-300 bg-yellow-100 dark:bg-yellow-900 rounded-md p-2'
                  : ''
              }`}
            >
              <Input
                label={`Nama Wakil Ketua ${index + 1}`}
                name="nama"
                value={item.nama}
                onChange={(e) =>
                  handleSimpleListItemChange("wakil_ketua", index, e)
                }
                ref={(el) => {
                  wakilKetuaRefs.current[index] = el;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSimpleListItem("wakil_ketua", wakilKetuaRefs);
                  }
                }}
                className="flex-grow text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                isDisabled={loading}
                description={index === formData.wakil_ketua.length - 1 ? "Tekan Enter untuk menambah baris baru" : ""}
              />
              <Button
                type="button"
                color="danger"
                variant="flat"
                size="sm"
                onClick={() => removeSimpleListItem("wakil_ketua", index)}
                isDisabled={
                  (formData.wakil_ketua.length <= 1 && item.nama.trim() === "") || loading
                }
              >
                <TrashIcon /> Hapus
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => addSimpleListItem("wakil_ketua", wakilKetuaRefs)}
            color="secondary"
            variant="flat"
            className="text-base md:text-lg mt-4"
            isDisabled={loading}
          >
            <PlusIcon /> Tambah Wakil Ketua
          </Button>
        </Card>
      </details>

      <details>
        <summary className="text-xl font-semibold mb-4 cursor-pointer py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-md flex justify-between items-center text-gray-900 dark:text-gray-100">
          Wakil Sekretaris
          <span className="text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </summary>
        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-2">
          {formData.wakil_sekretaris.length === 0 || (formData.wakil_sekretaris.length === 1 && formData.wakil_sekretaris[0].nama.trim() === "") ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tambahkan wakil sekretaris pertama Anda.</p>
          ) : null}
          {formData.wakil_sekretaris.map((item, index) => (
            <div
              key={`wakil_sekretaris-${index}`}
            className={`flex items-center gap-4 mb-2 ${
              highlightedItem?.listName === 'wakil_sekretaris' && highlightedItem?.index === index
                ? 'transition-all duration-300 bg-yellow-100 dark:bg-yellow-900 rounded-md p-2'
                : ''
            }`}
            >
              <Input
                label={`Nama Wakil Sekretaris ${index + 1}`}
                name="nama"
                value={item.nama}
                onChange={(e) =>
                  handleSimpleListItemChange("wakil_sekretaris", index, e)
                }
                ref={(el) => {
                  wakilSekretarisRefs.current[index] = el;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSimpleListItem("wakil_sekretaris", wakilSekretarisRefs);
                  }
                }}
                className="flex-grow text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                isDisabled={loading}
                description={index === formData.wakil_sekretaris.length - 1 ? "Tekan Enter untuk menambah baris baru" : ""}
              />
              <Button
                type="button"
                color="danger"
                variant="flat"
                size="sm"
                onClick={() => removeSimpleListItem("wakil_sekretaris", index)}
                isDisabled={
                  (formData.wakil_sekretaris.length <= 1 && item.nama.trim() === "") || loading
                }
              >
                <TrashIcon /> Hapus
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => addSimpleListItem("wakil_sekretaris", wakilSekretarisRefs)}
            color="secondary"
            variant="flat"
            className="text-base md:text-lg mt-4"
            isDisabled={loading}
          >
            <PlusIcon /> Tambah Wakil Sekretaris
          </Button>
        </Card>
      </details>

      <details>
        <summary className="text-xl font-semibold mb-4 cursor-pointer py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-md flex justify-between items-center text-gray-900 dark:text-gray-100">
          Wakil Bendahara
          <span className="text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </summary>
        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-2">
          {formData.wakil_bendahara.length === 0 || (formData.wakil_bendahara.length === 1 && formData.wakil_bendahara[0].nama.trim() === "") ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tambahkan wakil bendahara pertama Anda.</p>
          ) : null}
          {formData.wakil_bendahara.map((item, index) => (
            <div
              key={`wakil_bendahara-${index}`}
              className={`flex items-center gap-4 mb-2 ${
                highlightedItem?.listName === 'wakil_bendahara' && highlightedItem?.index === index
                  ? 'transition-all duration-300 bg-yellow-100 dark:bg-yellow-900 rounded-md p-2'
                  : ''
              }`}
            >
              <Input
                label={`Nama Wakil Bendahara ${index + 1}`}
                name="nama"
                value={item.nama}
                onChange={(e) =>
                  handleSimpleListItemChange("wakil_bendahara", index, e)
                }
                ref={(el) => {
                  wakilBendaharaRefs.current[index] = el;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSimpleListItem("wakil_bendahara", wakilBendaharaRefs);
                  }
                }}
                className="flex-grow text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                isDisabled={loading}
                description={index === formData.wakil_bendahara.length - 1 ? "Tekan Enter untuk menambah baris baru" : ""}
              />
              <Button
                type="button"
                color="danger"
                variant="flat"
                size="sm"
                onClick={() => removeSimpleListItem("wakil_bendahara", index)}
                isDisabled={
                  (formData.wakil_bendahara.length <= 1 && item.nama.trim() === "") || loading
                }
              >
                <TrashIcon /> Hapus
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => addSimpleListItem("wakil_bendahara", wakilBendaharaRefs)}
            color="secondary"
            variant="flat"
            className="text-base md:text-lg mt-4"
            isDisabled={loading}
          >
            <PlusIcon /> Tambah Wakil Bendahara
          </Button>
        </Card>
      </details>

      {/* Bagian Dinamis untuk Departemen */}
      <details>
        <summary className="text-xl font-semibold mb-4 cursor-pointer py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-md flex justify-between items-center text-gray-900 dark:text-gray-100">
          Departemen
          <span className="text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </summary>
        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-2">
          {formData.departemen.length === 0 || (formData.departemen.length === 1 && formData.departemen[0].departemen.trim() === "" && formData.departemen[0].koordinator.trim() === "" && formData.departemen[0].anggota.every(a => a.nama.trim() === "")) ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tambahkan departemen pertama Anda.</p>
          ) : null}
          {formData.departemen.map((dep, depIndex) => (
            <Card
              key={`departemen-${depIndex}`}
              className={`p-4 mb-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative ${
                highlightedItem?.listName === `departemen-${depIndex}` && highlightedItem?.index === depIndex
                  ? 'transition-all duration-300 bg-yellow-100 dark:bg-yellow-900 rounded-md p-2'
                  : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100">
                  Departemen {depIndex + 1}
                </div>
                <Button
                  type="button"
                  color="danger"
                  variant="flat"
                  size="sm"
                  onClick={() => removeDepartemen(depIndex)}
                  isDisabled={
                    (formData.departemen.length <= 1 &&
                    dep.departemen.trim() === "" &&
                    dep.koordinator.trim() === "" &&
                    dep.anggota.every((a) => a.nama.trim() === "")) || loading
                  }
                  className="absolute top-2 right-2"
                >
                  <TrashIcon /> Hapus Departemen
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Nama Departemen"
                  name="departemen"
                  value={dep.departemen}
                  onChange={(e) => handleDepartemenChange(depIndex, e)}
                  className="text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  isDisabled={loading}
                />
                <Input
                  label="Koordinator"
                  name="koordinator"
                  value={dep.koordinator}
                  onChange={(e) => handleDepartemenChange(depIndex, e)}
                  className="text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  isDisabled={loading}
                />
              </div>
              <div className="ml-4 border-l pl-4">
                <h3 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">Anggota Departemen</h3>
                {dep.anggota.length === 0 || (dep.anggota.length === 1 && dep.anggota[0].nama.trim() === "") ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tambahkan anggota departemen pertama Anda.</p>
                ) : null}
                {dep.anggota.map((anggota, anggotaIndex) => (
                  <div
                    key={`departemen-${depIndex}-anggota-${anggotaIndex}`}
                    className={`flex items-center gap-4 mb-2 ${
                      highlightedItem?.listName === `departemenAnggota-${depIndex}` && highlightedItem?.index === anggotaIndex
                        ? 'transition-all duration-300 bg-yellow-100 dark:bg-yellow-900 rounded-md p-2'
                        : ''
                    }`}
                  >
                    <Input
                      label={`Anggota ${anggotaIndex + 1}`}
                      name="nama"
                      value={anggota.nama}
                      onChange={(e) =>
                        handleDepartemenAnggotaChange(depIndex, anggotaIndex, e)
                      }
                      ref={(el) => {
                        anggotaDepartemenRefs.current[
                          depIndex * 100 + anggotaIndex
                        ] = el;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addDepartemenAnggota(depIndex);
                        }
                      }}
                      className="flex-grow text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                      isDisabled={loading}
                      description={anggotaIndex === dep.anggota.length - 1 ? "Tekan Enter untuk menambah baris baru" : ""}
                    />
                    <Button
                      type="button"
                      color="danger"
                      variant="flat"
                      size="sm"
                      onClick={() =>
                        removeDepartemenAnggota(depIndex, anggotaIndex)
                      }
                      isDisabled={
                        (dep.anggota.length <= 1 && anggota.nama.trim() === "") || loading
                      }
                    >
                      <TrashIcon /> Hapus
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addDepartemenAnggota(depIndex)}
                  color="secondary"
                  variant="flat"
                  size="sm"
                  className="text-base md:text-sm mt-2"
                  isDisabled={loading}
                >
                  <PlusIcon /> Tambah Anggota
                </Button>
              </div>
            </Card>
          ))}
          <Button
            type="button"
            onClick={addDepartemen}
            color="secondary"
            variant="flat"
            className="text-base md:text-lg mt-4"
            isDisabled={loading}
          >
            <PlusIcon /> Tambah Departemen
          </Button>
        </Card>
      </details>

      {/* Bagian Dinamis untuk Lembaga */}
      <details>
        <summary className="text-xl font-semibold mb-4 cursor-pointer py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-md flex justify-between items-center text-gray-900 dark:text-gray-100">
          Lembaga
          <span className="text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </summary>
        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-2">
          {formData.lembaga.length === 0 || (formData.lembaga.length === 1 && formData.lembaga[0].lembaga.trim() === "" && formData.lembaga[0].direktur.trim() === "" && formData.lembaga[0].sekretaris_lembaga.trim() === "" && formData.lembaga[0].anggota_lembaga.every(a => a.nama.trim() === "")) ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tambahkan lembaga pertama Anda.</p>
          ) : null}
          {formData.lembaga.map((lem, lemIndex) => (
            <Card
              key={`lembaga-${lemIndex}`}
              className={`p-4 mb-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative ${
                highlightedItem?.listName === `lembaga-${lemIndex}` && highlightedItem?.index === lemIndex
                  ? 'transition-all duration-300 bg-yellow-100 dark:bg-yellow-900 rounded-md p-2'
                  : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100">
                  Lembaga {lemIndex + 1}
                </div>
                <Button
                  type="button"
                  color="danger"
                  variant="flat"
                  size="sm"
                  onClick={() => removeLembaga(lemIndex)}
                  isDisabled={
                    (formData.lembaga.length <= 1 &&
                    lem.lembaga.trim() === "" &&
                    lem.direktur.trim() === "" &&
                    lem.sekretaris_lembaga.trim() === "" &&
                    lem.anggota_lembaga.every((a) => a.nama.trim() === "")) || loading
                  }
                  className="absolute top-2 right-2"
                >
                  <TrashIcon /> Hapus Lembaga
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Nama Lembaga"
                  name="lembaga"
                  value={lem.lembaga}
                  onChange={(e) => handleLembagaChange(lemIndex, e)}
                  className="text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  isDisabled={loading}
                />
                <Input
                  label="Direktur"
                  name="direktur"
                  value={lem.direktur}
                  onChange={(e) => handleLembagaChange(lemIndex, e)}
                  className="text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  isDisabled={loading}
                />
                <Input
                  label="Sekretaris Lembaga"
                  name="sekretaris_lembaga"
                  value={lem.sekretaris_lembaga}
                  onChange={(e) => handleLembagaChange(lemIndex, e)}
                  className="text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  isDisabled={loading}
                />
              </div>
              <div className="ml-4 border-l pl-4">
                <h3 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">Anggota Lembaga</h3>
                {lem.anggota_lembaga.length === 0 || (lem.anggota_lembaga.length === 1 && lem.anggota_lembaga[0].nama.trim() === "") ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tambahkan anggota lembaga pertama Anda.</p>
                ) : null}
                {lem.anggota_lembaga.map((anggota, anggotaIndex) => (
                  <div
                    key={`lembaga-${lemIndex}-anggota-${anggotaIndex}`}
                    className={`flex items-center gap-4 mb-2 ${
                      highlightedItem?.listName === `lembagaAnggota-${lemIndex}` && highlightedItem?.index === anggotaIndex
                        ? 'transition-all duration-300 bg-yellow-100 dark:bg-yellow-900 rounded-md p-2'
                        : ''
                    }`}
                  >
                    <Input
                      label={`Anggota ${anggotaIndex + 1}`}
                      name="nama"
                      value={anggota.nama}
                      onChange={(e) =>
                        handleLembagaAnggotaChange(lemIndex, anggotaIndex, e)
                      }
                      ref={(el) => {
                        anggotaLembagaRefs.current[
                          lemIndex * 100 + anggotaIndex
                        ] = el;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLembagaAnggota(lemIndex);
                        }
                      }}
                      className="flex-grow text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                      isDisabled={loading}
                      description={anggotaIndex === lem.anggota_lembaga.length - 1 ? "Tekan Enter untuk menambah baris baru" : ""}
                    />
                    <Button
                      type="button"
                      color="danger"
                      variant="flat"
                      size="sm"
                      onClick={() => removeLembagaAnggota(lemIndex, anggotaIndex)}
                      isDisabled={
                        (lem.anggota_lembaga.length <= 1 &&
                        anggota.nama.trim() === "") || loading
                      }
                    >
                      <TrashIcon /> Hapus
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addLembagaAnggota(lemIndex)}
                  color="secondary"
                  variant="flat"
                  size="sm"
                  className="text-base md:text-sm mt-2"
                  isDisabled={loading}
                >
                  <PlusIcon /> Tambah Anggota
                </Button>
              </div>
            </Card>
          ))}
          <Button
            type="button"
            onClick={addLembaga}
            color="secondary"
            variant="flat"
            className="text-base md:text-lg mt-4"
            isDisabled={loading}
          >
            <PlusIcon /> Tambah Lembaga
          </Button>
        </Card>
      </details>

      {/* Bagian Dinamis untuk CBP */}
      <details>
        <summary className="text-xl font-semibold mb-4 cursor-pointer py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-md flex justify-between items-center text-gray-900 dark:text-gray-100">
          Corp Brigade Pembangunan (CBP)
          <span className="text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </summary>
        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <Input
              label="Komandan"
              name="komandan"
              value={formData.cbp.komandan}
              onChange={handleCbpChange}
              className="text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
              isDisabled={loading}
            />
          </div>

          <div className="ml-4 border-l pl-4 mb-4">
            <h3 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">Wakil Komandan</h3>
            {formData.cbp.wakil_komandan.length === 0 || (formData.cbp.wakil_komandan.length === 1 && formData.cbp.wakil_komandan[0].nama.trim() === "") ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tambahkan wakil komandan pertama Anda.</p>
            ) : null}
            {formData.cbp.wakil_komandan.map((item, index) => (
              <div
                key={`cbp-wakil-komandan-${index}`}
                className={`flex items-center gap-4 mb-2 ${
                  highlightedItem?.listName === 'cbp-wakil_komandan' && highlightedItem?.index === index
                    ? 'transition-all duration-300 bg-yellow-100 dark:bg-yellow-900 rounded-md p-2'
                    : ''
                }`}
              >
                <Input
                  label={`Wakil Komandan ${index + 1}`}
                  name="nama"
                  value={item.nama}
                  onChange={(e) =>
                    handleCbpSimpleListChange("wakil_komandan", index, e)
                  }
                  ref={(el) => {
                    wakilKomandanRefs.current[index] = el;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCbpSimpleListItem("wakil_komandan", wakilKomandanRefs);
                    }
                  }}
                  className="flex-grow text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  isDisabled={loading}
                  description={index === formData.cbp.wakil_komandan.length - 1 ? "Tekan Enter untuk menambah baris baru" : ""}
                />
                <Button
                  type="button"
                  color="danger"
                  variant="flat"
                  size="sm"
                  onClick={() => removeCbpSimpleListItem("wakil_komandan", index)}
                  isDisabled={
                    (formData.cbp.wakil_komandan.length <= 1 &&
                    item.nama.trim() === "") || loading
                  }
                >
                  <TrashIcon /> Hapus
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={() => addCbpSimpleListItem("wakil_komandan", wakilKomandanRefs)}
              color="secondary"
              variant="flat"
              size="sm"
              className="text-base md:text-sm mt-2"
              isDisabled={loading}
            >
              <PlusIcon /> Tambah Wakil Komandan
            </Button>
          </div>

          {/* CBP Divisi manual */}
          {formData.cbp.divisi.length === 0 || (formData.cbp.divisi.length === 1 && formData.cbp.divisi[0].divisi.trim() === "" && formData.cbp.divisi[0].kepala.trim() === "" && formData.cbp.divisi[0].anggota_divisi.every(a => a.nama.trim() === "")) ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tambahkan divisi CBP pertama Anda.</p>
          ) : null}
          {formData.cbp.divisi.map((div, divIndex) => (
            <Card
              key={`cbp-divisi-${divIndex}`}
              className={`p-4 mb-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative ${
                highlightedItem?.listName === `cbpDivisi-${divIndex}` && highlightedItem?.index === divIndex
                  ? 'transition-all duration-300 bg-yellow-100 dark:bg-yellow-900 rounded-md p-2'
                  : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100">
                  Divisi {divIndex + 1}
                </div>
                <Button
                  type="button"
                  color="danger"
                  variant="flat"
                  size="sm"
                  onClick={() => removeCbpDivisi(divIndex)}
                  isDisabled={
                    (formData.cbp.divisi.length <= 1 &&
                    div.divisi.trim() === "" &&
                    div.kepala.trim() === "" &&
                    div.anggota_divisi.every((a) => a.nama.trim() === "")) || loading
                  }
                  className="absolute top-2 right-2"
                >
                  <TrashIcon /> Hapus Divisi
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Nama Divisi"
                  name="divisi"
                  value={div.divisi}
                  onChange={(e) => handleCbpDivisiChange(divIndex, e)}
                  className="text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  isDisabled={loading}
                />
                <Input
                  label="Kepala Divisi"
                  name="kepala"
                  value={div.kepala}
                  onChange={(e) => handleCbpDivisiChange(divIndex, e)}
                  className="text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  isDisabled={loading}
                />
              </div>
              <div className="ml-4 border-l pl-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Anggota Divisi</h4>
                {div.anggota_divisi.length === 0 || (div.anggota_divisi.length === 1 && div.anggota_divisi[0].nama.trim() === "") ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tambahkan anggota divisi pertama Anda.</p>
                ) : null}
                {div.anggota_divisi.map((anggota, anggotaIndex) => (
                  <div
                    key={`cbp-divisi-${divIndex}-anggota-${anggotaIndex}`}
                    className={`flex items-center gap-4 mb-2 ${
                      highlightedItem?.listName === `cbpDivisiAnggota-${divIndex}` && highlightedItem?.index === anggotaIndex
                        ? 'transition-all duration-300 bg-yellow-100 dark:bg-yellow-900 rounded-md p-2'
                        : ''
                    }`}
                  >
                    <Input
                      label={`Anggota ${anggotaIndex + 1}`}
                      name="nama"
                      value={anggota.nama}
                      onChange={(e) =>
                        handleCbpDivisiAnggotaChange(divIndex, anggotaIndex, e)
                      }
                      ref={(el) => {
                        if (!anggotaCbpDivisiRefs.current[divIndex])
                          anggotaCbpDivisiRefs.current[divIndex] = [];
                        anggotaCbpDivisiRefs.current[divIndex][anggotaIndex] = el;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCbpDivisiAnggota(divIndex);
                        }
                      }}
                      className="flex-grow text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                      isDisabled={loading}
                      description={anggotaIndex === div.anggota_divisi.length - 1 ? "Tekan Enter untuk menambah baris baru" : ""}
                    />
                    <Button
                      type="button"
                      color="danger"
                      variant="flat"
                      size="sm"
                      onClick={() =>
                        removeCbpDivisiAnggota(divIndex, anggotaIndex)
                      }
                      isDisabled={
                        (div.anggota_divisi.length <= 1 &&
                        anggota.nama.trim() === "") || loading
                      }
                    >
                      <TrashIcon /> Hapus
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addCbpDivisiAnggota(divIndex)}
                  color="secondary"
                  variant="flat"
                  size="sm"
                  className="text-base md:text-sm mt-2"
                  isDisabled={loading}
                >
                  <PlusIcon /> Tambah Anggota
                </Button>
              </div>
            </Card>
          ))}
          <Button
            type="button"
            onClick={addCbpDivisi}
            color="secondary"
            variant="flat"
            className="text-base md:text-lg mt-4"
            isDisabled={loading}
          >
            <PlusIcon /> Tambah Divisi
          </Button>
        </Card>
      </details>

      {/* Tampilkan nomor surat jika sudah ada */}
      {formData.nomor_surat && (
        <div className="md:col-span-2">
          <Input
            label="Nomor Surat (Generated)"
            name="nomor_surat"
            value={formData.nomor_surat}
            readOnly
            className="text-base md:text-lg w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 cursor-not-allowed"
            isDisabled={true} // Selalu dinonaktifkan karena ini adalah output
          />
        </div>
      )}

      <Button
        type="submit"
        color="primary"
        isLoading={loading}
        className="text-base md:text-lg py-4 md:py-6 w-full md:w-auto"
        isDisabled={loading}
      >
        Buat Surat
      </Button>
    </form>
  );
}
