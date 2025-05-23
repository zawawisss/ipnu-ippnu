import mongoose, { Schema, model, models } from "mongoose";

const KeuanganSchema = new Schema(
  {
    tanggal: { type: Date, required: true },
    sumber: { type: String },
    penggunaan: { type: String },
    debet: { type: Number, default: 0 },
    kredit: { type: Number, default: 0 },
    jumlah: { type: Number, default: 0 }, // Tetap simpan jumlah asli
    ket: { type: String },
  },
  { timestamps: true }
);

export default models.Keuangan || model("Keuangan", KeuanganSchema);
