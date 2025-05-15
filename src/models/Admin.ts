import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
    username: string;
    password: string;
    role: string;
}

const AdminSchema: Schema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, required: true},
});

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema, 'admin');
