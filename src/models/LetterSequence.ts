import mongoose, { Schema, Document } from 'mongoose';

export interface ILetterSequence extends Document {
  letterType: string;
  lastSequenceNumber: number;
}

const LetterSequenceSchema: Schema = new Schema({
  letterType: { type: String, required: true, unique: true },
  lastSequenceNumber: { type: Number, required: true, default: 0 },
});

const LetterSequence = mongoose.models.LetterSequence || mongoose.model<ILetterSequence>('LetterSequence', LetterSequenceSchema);

export default LetterSequence;
