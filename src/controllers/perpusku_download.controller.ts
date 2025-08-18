import { Request, Response } from 'express';
import { downloadFileService } from '../services/perpusku_download.service';

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
        console.error('Gagal memproses unduhan file:', error);
        const err = error as Error
        res.status(500).json({ message: err.message });
    }
};