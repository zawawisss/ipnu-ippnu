"use client";
import { useState } from "react";
import { Select, SelectItem, Card } from "@heroui/react";
import FormSuratTugas from "@/app/components/surat/FormSuratTugas";
import FormSuratPengesahan from "@/app/components/surat/FormSuratPengesahan";

const JENIS_SURAT = [
  { label: "Surat Tugas", value: "tugas" },
  { label: "Surat Pengesahan", value: "pengesahan" },
] as const;

type JenisSurat = (typeof JENIS_SURAT)[number]["value"];

export default function TambahSuratPage() {
  const [jenisSurat, setJenisSurat] = useState<JenisSurat | "">("");

  const renderForm = () => {
    switch (jenisSurat) {
      case "tugas":
        return <FormSuratTugas />;
      case "pengesahan":
        return <FormSuratPengesahan />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-start py-8 px-2 sm:px-8 md:px-12 bg-transparent">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl p-6 md:p-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-10 text-primary-700 dark:text-primary-200">
          Buat Surat
        </h1>
        <div className="mb-6">
          <Select
            label="Pilih Jenis Surat"
            placeholder="Pilih..."
            onChange={(e) => setJenisSurat(e.target.value as JenisSurat)}
            value={jenisSurat}
            className="w-full text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
          >
            {JENIS_SURAT.map((j) => (
              <SelectItem key={j.value} id={j.value}>
                {j.label}
              </SelectItem>
            ))}
          </Select>
        </div>
        {renderForm()}
      </Card>
    </div>
  );
}
