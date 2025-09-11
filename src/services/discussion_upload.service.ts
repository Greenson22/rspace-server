// src/services/discussion_upload.service.ts

import { Request } from 'express';

export const uploadFileService = (req: Request) => {
    if (!req.file) {
        throw new Error('Pilih file .zip untuk diunggah.');
    }

    return {
        message: 'File diskusi berhasil diunggah!',
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path
    };
};