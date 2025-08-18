import { Request, Response } from 'express';

export const handleUpload = (req: Request, res: Response) => {
    // Middleware 'upload' sudah menangani error dan keberadaan file.
    // Jika kode sampai di sini, berarti file berhasil diunggah.
    
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