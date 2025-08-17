import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors'; // <-- 1. TAMBAHKAN INI

const app = express();
const PORT = 3000;

// =======================================================
// Izinkan semua request dari origin manapun (CORS)
app.use(cors()); // <-- 2. GUNAKAN DI SINI (sebelum route Anda)
// =======================================================

// Tentukan folder tujuan untuk penyimpanan file
const uploadDir = path.join(__dirname, 'storage/RSpace_data');

// Pastikan direktori tujuan ada, jika tidak, buat direktorinya
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Multer untuk penyimpanan file
const storage = multer.diskStorage({
    // Menentukan folder tujuan upload
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    // Menentukan nama file yang akan disimpan (menggunakan nama asli)
    filename: function (req, file, cb) {
        // Validasi sederhana untuk memastikan hanya file .zip yang diizinkan
        if (!file.originalname.match(/\.zip$/)) {
            return cb(new Error('Hanya file .zip yang diizinkan!'), '');
        }
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

/**
 * Endpoint untuk mengunggah file.
 * Gunakan metode POST ke /upload
 * Key untuk form-data harus 'zipfile'
 */
app.post('/upload', (req: Request, res: Response) => {
    
    const uploader = upload.single('zipfile'); // 'zipfile' adalah nama field dari form

    uploader(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Terjadi error dari Multer (misal: file terlalu besar)
            return res.status(500).json({ error: err.message });
        } else if (err) {
            // Terjadi error lain (misal: validasi tipe file gagal)
            return res.status(400).json({ error: err.message });
        }

        // Jika tidak ada file yang diunggah
        if (!req.file) {
            return res.status(400).send({ message: 'Pilih file .zip untuk diunggah.' });
        }

        // Jika berhasil, kirim respon sukses
        res.status(200).send({
            message: 'File berhasil diunggah!',
            filePath: req.file.path
        });
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});