import { noteModel } from './Schema/schema.js'; // Modeli import edirik
import axios from 'axios';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
const mongoURI = 'mongodb+srv://nigarhesenzade703:13102004@cluster0.zxjn7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

// View engine EJS olaraq təyin olunur
app.set('view engine', 'ejs');

// URL kodlaşdırılmasını dəstəkləyən body-parser
app.use(express.urlencoded({ extended: true }));

// Statik fayllar üçün 'public' qovluğunun istifadəsi
app.use(express.static('public'));

// Ana səhifə sorğusu
app.get('/', (req, res) => {
    res.render('index', { translation: null, error: null });
});

app.post('/translate', async (req, res) => {
    const { text, sourcelang, targetlang } = req.body;

    // Check if the input word is "hello"
    if (text.toLowerCase() === 'hello') {
        // const translation = 'salam';
        
        // Save the translation to the database
        const existingNote = await noteModel.findOne({
            soz: text,
            sourceLang: sourcelang,
            targetLang: targetlang
        });

        if (!existingNote) {
            const newNote = new noteModel({
                soz: text,
                tercumesi: translation,
                sourceLang: sourcelang,
                targetLang: targetlang
            });

            await newNote.save();
        }

        const words = await noteModel.find({});
        return res.send('index', { translation, words, error: null });
    }

    try {
        // Check for existing translation in the database
        const existingNote = await noteModel.findOne({
            soz: text,
            sourceLang: sourcelang,
            targetLang: targetlang
        });

        if (existingNote) {
            const words = await noteModel.find({});
            return res.send('index', { translation: null, words, error: 'Bu söz artıq lüğətdə var.' });
        }

        // Get the translation from the API
        const encodedParams = new URLSearchParams();
        encodedParams.append('source_language', sourcelang);
        encodedParams.append('target_language', targetlang);
        encodedParams.append('text', text);

        const options = {
            method: 'POST',
            url: 'https://text-translator2.p.rapidapi.com/translate',
            headers: {
                'x-rapidapi-key': '7a4c03adc4msh95603aae6550e81p1a12d6jsn312ad112b671',
                'x-rapidapi-host': 'text-translator2.p.rapidapi.com',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: encodedParams
        };

        const response = await axios.request(options);
        const translation = response.data.data.translatedText;

        // Save the translation to the database
        const newNote = new noteModel({
            soz: text,
            tercumesi: translation,
            sourceLang: sourcelang,
            targetLang: targetlang
        });

        await newNote.save();

        const words = await noteModel.find({});
        res.render('index', { translation, words, error: null });
    } catch (error) {
        console.error(error);
        res.render('index', { translation: null, words: [], error: 'Tərcümə zamanı xəta baş verdi.' });
    }
});


// Bütün məlumatları göstərən `/words` route-u
app.get('/words', async (req, res) => {
    try {
        // Bütün məlumatları bazadan əldə edirik
        const words = await noteModel.find({});
        res.render('words', { words }); // EJS templatedə göstərmək üçün məlumatları render edirik
    } catch (error) {
        console.error('Bazadan məlumatları əldə edərkən xəta:', error);
        res.status(500).send('Xəta baş verdi.');
    }
});
app.delete('/words/:id', async (req, res) => {
    try {
        const word = await noteModel.findByIdAndDelete(req.params.id);
        if (!word) {
            return res.status(404).json({ message: 'Söz tapılmadı' });
        }
        res.json({ message: 'Söz uğurla silindi', word });
    } catch (err) {
        console.error('Silmə zamanı xəta baş verdi:', err.message); // Xətanın detalları
        res.status(500).json({ message: 'Xəta baş verdi', error: err.message });
    }
});


app.get('/delete', async (req, res) => {
    try {
        const words = await noteModel.find({}); // Bütün sözləri əldə edirik
        res.render('deleted', { words }); // deleted.ejs faylını render edirik və sözləri göndəririk
    } catch (error) {
        res.status(500).send('Sözləri əldə edərkən xəta baş verdi.');
    }
});

// Sözün silinməsi üçün route
app.delete('/words/:id', async (req, res) => {
    try {
        const word = await noteModel.findByIdAndDelete(req.params.id);
        if (!word) {
            return res.status(404).json({ message: 'Söz tapılmadı' });
        }
        res.json({ message: 'Söz uğurla silindi', word });
    } catch (err) {
        res.status(500).json({ message: 'Xəta baş verdi', error: err.message });
    }
});

// Server işə salınır və MongoDB ilə bağlantı qurulur
app.listen(3000, () => {
    console.log('Server 3000 portunda işə düşdü.');
    mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB-ə uğurla bağlanıldı');
    })
    .catch((error) => {
        console.error('MongoDB-yə bağlanarkən xəta:', error);
    });
});
