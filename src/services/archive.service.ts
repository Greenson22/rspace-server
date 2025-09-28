// src/services/archive.service.ts

import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import { rootPath } from '../config/path';

export const archiveDiscussionsService = (req: Request) => {
    if (!req.file) {
        throw new Error('File arsip .zip tidak ditemukan dalam permintaan.');
    }

    const uploadDir = path.join(rootPath, 'storage', 'Archive_data');
    const tempFilePath = req.file.path; // Path file sementara yang diunggah multer
    const targetFilename = 'FinishedDiscussionsArchive.zip';
    const targetFilePath = path.join(uploadDir, targetFilename);

    // Jika file arsip utama sudah ada, buat cadangannya
    if (fs.existsSync(targetFilePath)) {
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
        const archiveBackupFilename = `Archive_backup_${timestamp}.zip`;
        const archiveBackupPath = path.join(uploadDir, archiveBackupFilename);
        
        fs.renameSync(targetFilePath, archiveBackupPath);
        console.log(`Arsip lama disimpan sebagai: ${archiveBackupFilename}`);
    }

    // Ganti nama file sementara menjadi nama file arsip utama
    fs.renameSync(tempFilePath, targetFilePath);

    // Perbarui metadata waktu unggah
    const metadataPath = path.join(uploadDir, 'metadata.json');
    const metadata = {
        lastUploadedAt: new Date().toISOString(),
        uploadedAtFormatted: new Date().toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar'
        })
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return {
        message: 'Arsip diskusi berhasil diunggah dan disimpan di server!',
        fileName: targetFilename, // Kembalikan nama file target
        originalName: req.file.originalname,
        path: targetFilePath
    };
};