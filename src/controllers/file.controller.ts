import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { rootPath } from '../config/path';

// Interface untuk struktur metadata
interface FileMetadata {
    uniqueName: string;
    originalName: string;
    createdAt: number;
}

export const getFileList = (req: Request, res: Response, next: NextFunction) => {
    try {
        const metadataPath = path.join(rootPath, 'storage', 'RSpace_data', 'metadata.json');

        if (!fs.existsSync(metadataPath)) {
            return res.status(200).json([]);
        }

        const fileContent = fs.readFileSync(metadataPath, 'utf-8');
        const metadata: FileMetadata[] = JSON.parse(fileContent);

        const fileListWithDate = metadata.map(file => ({
            uniqueName: file.uniqueName,
            originalName: file.originalName,
            createdAt: file.createdAt,
            uploadedAt: new Date(file.createdAt).toLocaleString('id-ID', {
                timeZone: 'Asia/Makassar',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })
        }));
        
        fileListWithDate.sort((a, b) => b.createdAt - a.createdAt);

        res.status(200).json(fileListWithDate);

    } catch (error) {
        next(error);
    }
};

export const getFileDetail = (req: Request, res: Response, next: NextFunction) => {
    const { uniqueName } = req.params;
    try {
        const metadataPath = path.join(rootPath, 'storage', 'RSpace_data', 'metadata.json');

        if (!fs.existsSync(metadataPath)) {
            return res.status(404).json({ type: 'NotFound', message: 'File metadata tidak ditemukan.' });
        }

        const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
        const metadata: FileMetadata[] = JSON.parse(metadataContent);

        const fileData = metadata.find(file => file.uniqueName === uniqueName);

        if (!fileData) {
            return res.status(404).json({ type: 'NotFound', message: 'File tidak ditemukan di dalam metadata.' });
        }
        
        res.status(200).json({
            uniqueName: fileData.uniqueName,
            originalName: fileData.originalName,
            createdAt: fileData.createdAt,
            uploadedAt: new Date(fileData.createdAt).toLocaleString('id-ID', {
                timeZone: 'Asia/Makassar',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })
        });

    } catch (error) {
        next(error);
    }
};

export const deleteFile = (req: Request, res: Response, next: NextFunction) => {
    const { uniqueName } = req.params;
    
    try {
        const storageDir = path.join(rootPath, 'storage', 'RSpace_data');
        const metadataPath = path.join(storageDir, 'metadata.json');
        
        if (!fs.existsSync(metadataPath)) {
            return res.status(404).json({ type: 'NotFound', message: 'File metadata tidak ditemukan.' });
        }

        const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
        let metadata: FileMetadata[] = JSON.parse(metadataContent);

        const fileIndex = metadata.findIndex(file => file.uniqueName === uniqueName);

        if (fileIndex === -1) {
            return res.status(404).json({ type: 'NotFound', message: 'Entri file tidak ditemukan di metadata.' });
        }

        // Hapus file fisik dengan menambahkan ekstensi .zip
        const filePath = path.join(storageDir, `${uniqueName}.zip`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Hapus entri dari metadata
        metadata.splice(fileIndex, 1);
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

        res.status(200).json({ message: `File ${uniqueName} berhasil dihapus.` });

    } catch (error) {
        next(error);
    }
};