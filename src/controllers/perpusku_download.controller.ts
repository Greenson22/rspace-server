// src/controllers/perpusku_download.controller.ts

import { Request, Response } from 'express';
import { downloadFileService } from '../services/perpusku_download.service';

// ==> FUNGSI INI DIPERBARUI MENJADI ASYNC DAN MENGAMBIL userId <==
export const handleDownloadFile = async (req: Request, res: Response) => {
    const { uniqueName } = req.params;
    // Ambil userId dari token JWT
    const userId = req.user!.userId;

    try {
        // Kirim userId ke service
        const file = await downloadFileService(userId, uniqueName);
        res.download(file.filePath, file.originalName, (err) => {
            if (err) {
                console.error("Error saat mengirim file:", err);
            }
        });
    } catch (error) {
        const err = error as Error;
        console.error('Gagal memproses unduhan file PerpusKu:', err);

        if (!res.headersSent) {
            if (err.message.includes('metadata') || err.message.includes('fisik') || err.message.includes('tidak ditemukan')) {
                return res.status(404).json({ message: err.message });
            }
            res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    }
};