import { Schema, model } from 'mongoose';

// Şema tərifi
const noteSchema = new Schema({
    soz: String,
    tercumesi: String,
    sourceLang: String, 
    targetLang: String
}, { versionKey: false });

// Model yaradılır
export const noteModel = model('words', noteSchema);
