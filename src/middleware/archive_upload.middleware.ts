// src/middleware/archive_upload.middleware.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { rootPath } from '../config/path';

// Tentukan direktori untuk unggahan temporer
const tempUploadDir = path.join(rootPath, 'storage', 'temp_uploads');
fs.ensureDirSync(tempUploadDir); // Pastikan folder ini ada

// Konfigurasi multer untuk menyimpan file ke disk temporer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempUploadDir);
    },
    filename: (req, file, cb) => {
        // Beri nama acak untuk menghindari konflik jika ada unggahan simultan
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: storage, // Gunakan konfigurasi storage di atas
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.zip$/)) {
            return cb(new Error('Hanya file .zip yang diizinkan!'));
        }
        cb(null, true);
    }
});