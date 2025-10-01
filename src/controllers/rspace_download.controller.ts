// src/controllers/rspace_download.controller.ts

import { Request, Response } from 'express';
// ## PERUBAHAN 1: Impor service baru ##
import { downloadSrcService, downloadClientSrcService, downloadFileService } from '../services/rspace_download.service';

export const handleDownloadSrc = (req: Request, res: Response) => {
    try {
        const { archive, zipFileName } = downloadSrcService();

        res.attachment(zipFileName);
        archive.on('error', (err) => { throw err; });
        archive.pipe(res);
        archive.finalize();
    } catch (error) {
        console.error('Gagal memproses unduhan src:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengunduh src.' });
    }
};

// ## PERUBAHAN 2: Tambahkan controller baru ##
export const handleDownloadClientSrc = (req: Request, res: Response) => {
    try {
        const { archive, zipFileName } = downloadClientSrcService();

        res.attachment(zipFileName);
        archive.on('error', (err) => { throw err; });
        archive.pipe(res);
        archive.finalize();
    } catch (error) {
        console.error('Gagal memproses unduhan client/src:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengunduh client/src.' });
    }
};

export const handleDownloadFile = (req: Request, res: Response) => {
    const { uniqueName } = req.params;
    try {
        const file = downloadFileService(uniqueName);
        res.download(file.filePath, file.originalName, (err) => {
            if (err) {
                console.error("Error saat mengirim file:", err);
            }
        });
    } catch (error) {
        const err = error as Error;
        console.error('Gagal memproses unduhan file:', err);

        if (!res.headersSent) {
            if (err.message.includes('metadata') || err.message.includes('fisik')) {
                return res.status(404).json({ message: err.message });
            }
            res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    }
};