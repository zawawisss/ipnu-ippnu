import mongoose, { Document, Schema } from 'mongoose';

// Interface untuk mendefinisikan tipe data Event
export interface IEvent extends Document {
  name: string;
  date: Date;
  time: string;
  location: string;
  ipnuAttendees: string[];
  ippnuAttendees: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Skema Mongoose untuk Event
const EventSchema: Schema = new Schema(
  {
    name: { type: String, required: true }, // Nama acara
    date: { type: Date, required: true },   // Tanggal acara
    time: { type: String, required: true }, // Waktu acara (contoh: "13.30 - selesai")
    location: { type: String, required: true }, // Lokasi acara
    ipnuAttendees: { type: [String], default: [] }, // Daftar peserta IPNU
    ippnuAttendees: { type: [String], default: [] }, // Daftar peserta IPPNU
  },
  {
    timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
  }
);

// Mengekspor model Event. Jika model sudah ada, gunakan yang sudah ada.
const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;

