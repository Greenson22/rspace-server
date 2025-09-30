// src/middleware/profile_picture_upload.middleware.ts

import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { getUserStoragePath } from '../config/path';

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const userId = req.user?.userId;
        if (!userId) {
            return cb(new Error('Autentikasi gagal, ID pengguna tidak ditemukan.'), '');
        }
        // Simpan file ke direktori profile_pictures milik pengguna
        const userProfilePicPath = getUserStoragePath(userId, 'profile_pictures');
        cb(null, userProfilePicPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Buat nama file unik untuk menghindari konflik
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newFilename = `profile-${uniqueSuffix}${path.extname(file.originalname)}`;
        cb(null, newFilename);
    }
});

// Filter untuk memastikan hanya file gambar yang diunggah
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diizinkan!'));
    }
};

export const uploadProfilePicture = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Batas ukuran file 5 MB
});