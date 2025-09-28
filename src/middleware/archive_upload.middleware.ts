// src/middleware/archive_upload.middleware.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { rootPath } from '../config/path';

// Tentukan dan buat folder penyimpanan jika belum ada
const uploadDir = path.join(rootPath, 'storage', 'Archive_data');
fs.mkdirSync(uploadDir, { recursive: true });

// Nama file yang konsisten untuk arsip utama
const targetFilename = 'FinishedDiscussionsArchive.zip';

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        if (!file.originalname.match(/\.zip$/)) {
            return cb(new Error('Hanya file .zip yang diizinkan!'), '');
        }

        const targetFilePath = path.join(uploadDir, targetFilename);

        // Jika file arsip utama sudah ada, buat cadangan
        if (fs.existsSync(targetFilePath)) {
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
            const archiveFilename = `Archive_backup_${timestamp}.zip`;
            const archiveFilePath = path.join(uploadDir, archiveFilename);
            
            fs.renameSync(targetFilePath, archiveFilePath);
            console.log(`Arsip lama disimpan sebagai: ${archiveFilename}`);
        }
        
        // Gunakan nama file target untuk file yang baru diunggah
        cb(null, targetFilename);
    }
});

export const upload = multer({ storage: storage });