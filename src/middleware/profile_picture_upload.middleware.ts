// src/middleware/profile_picture_upload.middleware.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs-extra'; // Menggunakan fs-extra untuk kemudahan
import { Request } from 'express';
import { getUserStoragePath } from '../config/path';

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const userId = req.user?.userId;
        if (!userId) {
            return cb(new Error('Autentikasi gagal, ID pengguna tidak ditemukan.'), '');
        }
        
        const userProfilePicPath = getUserStoragePath(userId, 'profile_pictures');
        cb(null, userProfilePicPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // ==> PERUBAHAN UTAMA 1: Hapus file lama sebelum menyimpan yang baru <==
        const userId = req.user?.userId;
        if (userId) {
            const userProfilePicPath = getUserStoragePath(userId, 'profile_pictures');
            // Baca semua file di direktori
            fs.readdir(userProfilePicPath, (err, files) => {
                if (err) {
                    console.error("Gagal membaca direktori foto profil:", err);
                    // Lanjutkan meskipun gagal membaca, agar upload tidak gagal total
                } else {
                    // Hapus semua file yang ada di direktori tersebut
                    for (const oldFile of files) {
                        fs.unlink(path.join(userProfilePicPath, oldFile), err => {
                            if (err) console.error(`Gagal menghapus foto profil lama: ${oldFile}`, err);
                            else console.log(`Foto profil lama dihapus: ${oldFile}`);
                        });
                    }
                }
            });
        }
        
        // ==> PERUBAHAN UTAMA 2: Gunakan nama file yang konsisten <==
        // Simpan file dengan nama 'profile' + ekstensi aslinya (e.g., profile.jpg, profile.png)
        const newFilename = `profile${path.extname(file.originalname)}`;
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