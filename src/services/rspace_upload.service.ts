import { Request } from 'express';

export const uploadFileService = (req: Request) => {
    if (!req.file) {
        throw new Error('Pilih file .zip untuk diunggah.');
    }

    return {
        message: 'File berhasil diunggah dan metadata diperbarui!',
        originalName: req.file.originalname,
        uniqueName: req.file.filename,
        filePath: req.file.path
    };
};