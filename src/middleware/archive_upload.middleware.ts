// src/middleware/archive_upload.middleware.ts

import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { getUserStoragePath } from '../config/path'; // <-- Import helper baru

// Konfigurasi multer untuk menyimpan file ke disk temporer per pengguna
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        // Ambil userId dari token yang sudah divalidasi oleh jwtAuth
        const userId = req.user?.userId;
        if (!userId) {
            return cb(new Error('Autentikasi gagal, ID pengguna tidak ditemukan.'), '');
        }
        
        // Buat atau dapatkan path temporer untuk user ini
        const tempUploadDir = getUserStoragePath(userId, 'temp_uploads');
        cb(null, tempUploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.zip$/)) {
            return cb(new Error('Hanya file .zip yang diizinkan!'));
        }
        cb(null, true);
    }
});