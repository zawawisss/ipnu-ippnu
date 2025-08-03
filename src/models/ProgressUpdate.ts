import mongoose, { Document, Schema } from 'mongoose';

// Interface untuk Progress Update  
export interface IProgressUpdate extends Document {
  program_kerja_id?: mongoose.Types.ObjectId; // Optional untuk form web
  unit_name: string;
  program_no: string;
  program_name?: string; // Nama program untuk form web
  progress_percentage: number;
  update_method: 'DASHBOARD' | 'WEB' | 'API';
  notes?: string;
  target_date?: Date; // Target completion date
  timestamp: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_by?: string;
  updated_by?: string;
  updated_at?: Date;
}

// Schema Progress Update
const ProgressUpdateSchema: Schema = new Schema(
  {
    program_kerja_id: {
      type: Schema.Types.ObjectId,
      ref: 'ProgramKerja',
      required: false, // Optional untuk form web
    },
    unit_name: { type: String, required: true },
    program_no: { type: String, required: true },
    program_name: { type: String }, // Nama program untuk form web
    progress_percentage: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    update_method: {
      type: String,
      enum: ['DASHBOARD', 'WEB', 'API'],
      default: 'WEB',
    },
    notes: { type: String },
    target_date: { type: Date }, // Target completion date
    timestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    created_by: { type: String },
    updated_by: { type: String },
    updated_at: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Index untuk optimasi query
ProgressUpdateSchema.index({ program_kerja_id: 1, timestamp: -1 });
ProgressUpdateSchema.index({ unit_name: 1, status: 1 });

const ProgressUpdate =
  mongoose.models.ProgressUpdate ||
  mongoose.model<IProgressUpdate>('ProgressUpdate', ProgressUpdateSchema);

export default ProgressUpdate;
