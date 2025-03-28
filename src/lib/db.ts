import mongoose from 'mongoose';
import { cache } from 'react';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI){
    throw new Error ("MongoDb belum diisi");
}

let cached = (global as any).mongoose || {conn: null, promise: null};

async function db(){
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose.connect(MONGODB_URI, opts).then( (mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default db;