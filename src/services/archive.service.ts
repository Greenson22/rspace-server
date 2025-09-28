// src/services/archive.service.ts

import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import { rootPath } from '../config/path';

export const archiveDiscussionsService = (req: Request) => {
    if (!req.file) {
        throw new Error('File arsip .zip tidak ditemukan dalam permintaan.');
    }

    // Perbarui metadata waktu unggah
    const metadataPath = path.join(rootPath, 'storage', 'Archive_data', 'metadata.json');
    const metadata = {
        lastUploadedAt: new Date().toISOString(),
        uploadedAtFormatted: new Date().toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar'
        })
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return {
        message: 'Arsip diskusi berhasil diunggah dan disimpan di server!',
        fileName: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path
    };
};