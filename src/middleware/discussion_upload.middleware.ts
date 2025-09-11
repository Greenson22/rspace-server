// src/middleware/discussion_upload.middleware.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { rootPath } from '../config/path';

// Tentukan dan buat folder penyimpanan jika belum ada
const uploadDir = path.join(rootPath, 'storage', 'Discussion_data');
fs.mkdirSync(uploadDir, { recursive: true });

// Tentukan path untuk file metadata
const metadataPath = path.join(uploadDir, 'metadata.json');
const targetFilename = 'Export-Finished-Discussions.zip';

// Fungsi untuk memperbarui metadata
const updateMetadata = () => {
    try {
        const metadata = {
            lastUploadedAt: new Date().toISOString(),
            uploadedAtFormatted: new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Makassar',
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            })
        };
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
        console.error('Gagal memperbarui metadata.json:', error);
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

        const targetFilePath = path.join(uploadDir, targetFilename);

        // Cek jika file target sudah ada
        if (fs.existsSync(targetFilePath)) {
            // Buat nama file arsip dengan format tanggal dan waktu
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
            const archiveFilename = `Finished-Discussions_${timestamp}.zip`;
            const archiveFilePath = path.join(uploadDir, archiveFilename);
            
            // Ubah nama file yang lama menjadi file arsip
            fs.renameSync(targetFilePath, archiveFilePath);
            console.log(`File lama diarsipkan sebagai: ${archiveFilename}`);
        }
        
        // Perbarui metadata setiap kali ada upload baru
        updateMetadata();

        // Gunakan nama file target untuk file yang baru diunggah
        cb(null, targetFilename);
    }
});

export const upload = multer({ storage: storage });