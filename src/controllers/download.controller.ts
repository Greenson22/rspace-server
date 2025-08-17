import { Request, Response } from 'express';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { rootPath } from '../config/path';

export const handleDownloadSrc = (req: Request, res: Response) => {
    const sourceDir = path.join(rootPath, 'src');
    const zipFileName = 'src-archive.zip';

    res.attachment(zipFileName);

    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(res);
    archive.directory(sourceDir, false);
    archive.finalize();
};

interface FileMetadata {
    uniqueName: string;
    originalName: string;
    createdAt: number;
}

export const handleDownloadFile = (req: Request, res: Response) => {
    const { uniqueName } = req.params;
    const storageDir = path.join(rootPath, 'storage', 'RSpace_data');
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

        // Tambahkan ekstensi .zip secara manual untuk menemukan file fisik
        const filePath = path.join(storageDir, `${uniqueName}.zip`);
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