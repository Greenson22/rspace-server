import { Request, Response } from 'express';

export const handleUpload = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Pilih file .zip untuk diunggah.' });
    }

    res.status(201).json({
        message: 'File berhasil diunggah dan metadata diperbarui!',
        originalName: req.file.originalname,
        uniqueName: req.file.filename,
        filePath: req.file.path
    });
};