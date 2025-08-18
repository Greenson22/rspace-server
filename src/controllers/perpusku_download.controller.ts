import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { rootPath } from '../config/path';

interface FileMetadata {
    uniqueName: string;
    originalName: string;
    createdAt: number;
}

export const handleDownloadFile = (req: Request, res: Response) => {
    const { uniqueName } = req.params;
    const storageDir = path.join(rootPath, 'storage', 'PerpusKu_data');
    const metadataPath = path.join(storageDir, 'metadata.json');

    try {
        if (!fs.existsSync(metadataPath)) {
            return res.status(404).json({ message: 'File metadata tidak ditemukan.' });
        }
        const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
        const metadata: FileMetadata[] = JSON.parse(metadataContent);

        const fileData = metadata.find(file => file.uniqueName === uniqueName);
        if (!fileData) {
            return res.status(404).json({ message: 'File tidak ditemukan di dalam metadata.' });
        }

        const filePath = path.join(storageDir, `${uniqueName}`);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File fisik tidak ditemukan di server.' });
        }

        res.download(filePath, fileData.originalName, (err) => {
            if (err) {
                console.error("Error saat mengirim file:", err);
            }
        });

    } catch (error) {
        console.error('Gagal memproses unduhan file:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};