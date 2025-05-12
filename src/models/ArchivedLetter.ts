import mongoose, { Schema, Document } from 'mongoose';

export interface IArchivedLetter extends Document {
  letterNumber: string;
  letterType: string;
  generationDate: Date;
  formData: any; // Store the form data as a flexible object
}

const ArchivedLetterSchema: Schema = new Schema({
  letterNumber: { type: String, required: true, unique: true },
  letterType: { type: String, required: true },
  generationDate: { type: Date, required: true, default: Date.now },
  formData: { type: Object, required: true },
});

const ArchivedLetter = mongoose.models.ArchivedLetter || mongoose.model<IArchivedLetter>('ArchivedLetter', ArchivedLetterSchema);

export default ArchivedLetter;
