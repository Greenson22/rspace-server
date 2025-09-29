// src/middleware/archive_upload.middleware.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { rootPath } from '../config/path';

const uploadDir = path.join(rootPath, 'storage', 'Archive_data');
fs.mkdirSync(uploadDir, { recursive: true });

const targetFilename = 'FinishedDiscussionsArchive.zip';

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        if (!file.originalname.match(/\.zip$/)) {
            return cb(new Error('Hanya file .zip yang diizinkan!'), '');
        }

        const targetFilePath = path.join(uploadDir, targetFilename);

        // Jika file arsip utama sudah ada, buat cadangannya terlebih dahulu
        if (fs.existsSync(targetFilePath)) {
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
            const archiveBackupFilename = `Archive_backup_${timestamp}.zip`;
            const archiveBackupPath = path.join(uploadDir, archiveBackupFilename);
            
            try {
                fs.renameSync(targetFilePath, archiveBackupPath);
                console.log(`Arsip lama disimpan sebagai: ${archiveBackupFilename}`);
            } catch (error) {
                 console.error("Gagal membuat cadangan arsip lama:", error);
                 // Lanjutkan saja, coba timpa file yang ada
            }
        }
        
        // Simpan file baru dengan nama target yang konsisten
        cb(null, targetFilename);
    }
});

export const upload = multer({ storage: storage });