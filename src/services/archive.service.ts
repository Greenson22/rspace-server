// src/services/archive.service.ts

import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { rootPath } from '../config/path';

export const archiveDiscussionsService = (req: Request) => {
    if (!req.file) {
        throw new Error('File arsip .zip tidak ditemukan dalam permintaan.');
    }

    const uploadDir = path.join(rootPath, 'storage', 'Archive_data');
    const tempFilePath = req.file.path;
    const targetFilename = 'FinishedDiscussionsArchive.zip';
    const targetFilePath = path.join(uploadDir, targetFilename);
    const extractDir = path.join(uploadDir, 'extracted');

    // === PERBAIKAN: Pastikan semua direktori yang diperlukan ada ===
    // Membuat folder 'storage/Archive_data' jika belum ada.
    fs.mkdirSync(uploadDir, { recursive: true });
    // =============================================================

    // Logika untuk mencadangkan arsip lama jika file zip utama sudah ada
    if (fs.existsSync(targetFilePath)) {
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
        const archiveBackupFilename = `Archive_backup_${timestamp}.zip`;
        const archiveBackupPath = path.join(uploadDir, archiveBackupFilename);
        
        fs.renameSync(targetFilePath, archiveBackupPath);
        console.log(`Arsip lama disimpan sebagai: ${archiveBackupFilename}`);
    }

    // Salin file dari path temporer ke path tujuan, lalu hapus temporer
    fs.copyFileSync(tempFilePath, targetFilePath);
    fs.unlinkSync(tempFilePath);

    // Hapus folder ekstraksi lama (jika ada) dan buat yang baru
    if (fs.existsSync(extractDir)) {
        fs.rmSync(extractDir, { recursive: true, force: true });
    }
    fs.mkdirSync(extractDir, { recursive: true });

    try {
        const zip = new AdmZip(targetFilePath);
        zip.extractAllTo(extractDir, /*overwrite*/ true);
        console.log(`Arsip berhasil diekstrak ke: ${extractDir}`);
    } catch (error) {
        console.error('Gagal mengekstrak file arsip:', error);
        throw new Error('File berhasil diunggah, tetapi gagal diekstrak di server.');
    }
    
    // Logika pembaruan metadata (tidak berubah)
    const metadataPath = path.join(uploadDir, 'metadata.json');
    const metadata = {
        lastUploadedAt: new Date().toISOString(),
        uploadedAtFormatted: new Date().toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar'
        })
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return {
        message: 'Arsip berhasil diunggah dan diekstrak di server!',
        fileName: targetFilename,
        originalName: req.file.originalname,
        path: targetFilePath
    };
};