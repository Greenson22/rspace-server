// src/services/archive.service.ts

import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { rootPath } from '../config/path';

export const archiveDiscussionsService = (req: Request) => {
    if (!req.file) {
        throw new Error('File arsip .zip tidak ditemukan atau gagal diproses oleh middleware.');
    }

    // Path file sekarang sudah pasti dan final
    const targetFilePath = req.file.path; 
    const uploadDir = path.dirname(targetFilePath);
    const extractDir = path.join(uploadDir, 'extracted');

    // Hapus folder ekstraksi lama dan buat yang baru
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
    
    // Perbarui metadata
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
        fileName: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path
    };
};