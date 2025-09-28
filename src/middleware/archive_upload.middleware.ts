// src/middleware/archive_upload.middleware.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { rootPath } from '../config/path';
import { v4 as uuidv4 } from 'uuid'; // Gunakan uuid untuk nama sementara

// Tentukan dan buat folder penyimpanan jika belum ada
const uploadDir = path.join(rootPath, 'storage', 'Archive_data');
fs.mkdirSync(uploadDir, { recursive: true });

// Konfigurasi penyimpanan sederhana
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        if (!file.originalname.match(/\.zip$/)) {
            return cb(new Error('Hanya file .zip yang diizinkan!'), '');
        }
        // Buat nama file sementara yang unik untuk menghindari konflik
        const tempFilename = `${uuidv4()}.tmp`;
        cb(null, tempFilename);
    }
});

export const upload = multer({ storage: storage });