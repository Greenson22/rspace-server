import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { rootPath } from '../config/path';
import { v4 as uuidv4 } from 'uuid';

// Tentukan dan buat folder penyimpanan jika belum ada
const uploadDir = path.join(rootPath, 'storage', 'RSpace_data');
fs.mkdirSync(uploadDir, { recursive: true });

// Tentukan path untuk file metadata
const metadataPath = path.join(uploadDir, 'metadata.json');

// Fungsi untuk memperbarui metadata
const updateMetadata = (uniqueName: string, originalName: string) => {
    try {
        let metadata = {};
        // Baca file metadata jika sudah ada
        if (fs.existsSync(metadataPath)) {
            const fileContent = fs.readFileSync(metadataPath, 'utf-8');
            metadata = fileContent ? JSON.parse(fileContent) : {};
        }

        // Tambahkan entri baru
        metadata[uniqueName] = originalName;

        // Tulis kembali ke file
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
        console.error('Gagal memperbarui metadata.json:', error);
        // Jika metadata krusial, Anda bisa melempar error di sini
    }
};


// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Hanya izinkan file .zip
        if (!file.originalname.match(/\.zip$/)) {
            return cb(new Error('Hanya file .zip yang diizinkan!'), '');
        }

        // Buat nama file unik menggunakan uuid
        const newFilename = `${uuidv4()}${path.extname(file.originalname)}`;
        
        // Panggil fungsi untuk memperbarui metadata
        updateMetadata(newFilename, file.originalname);

        cb(null, newFilename);
    }
});

// Buat instance multer middleware
export const upload = multer({ storage: storage });