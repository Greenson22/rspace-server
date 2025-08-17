import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { rootPath } from '../config/path';

// Tentukan dan buat folder penyimpanan jika belum ada
const uploadDir = path.join(rootPath, 'storage', 'RSpace_data');
fs.mkdirSync(uploadDir, { recursive: true });

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
        cb(null, file.originalname);
    }
});

// Buat instance multer middleware
export const upload = multer({ storage: storage });