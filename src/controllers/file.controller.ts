// src/controllers/file.controller.ts

import { Request, Response, NextFunction } from 'express'; // Impor NextFunction
import path from 'path';
import fs from 'fs';
import { rootPath } from '../config/path';

export const getFileList = (req: Request, res: Response, next: NextFunction) => { // Tambahkan next
    try {
        const metadataPath = path.join(rootPath, 'storage', 'RSpace_data', 'metadata.json');

        if (!fs.existsSync(metadataPath)) {
            return res.status(200).json([]);
        }

        const fileContent = fs.readFileSync(metadataPath, 'utf-8');
        const metadata = JSON.parse(fileContent);

        const fileList = Object.keys(metadata).map(uniqueName => ({
            uniqueName: uniqueName,
            originalName: metadata[uniqueName]
        }));

        res.status(200).json(fileList);

    } catch (error) {
        next(error); // Teruskan error
    }
};

export const deleteFile = (req: Request, res: Response, next: NextFunction) => { // Tambahkan next
    const { uniqueName } = req.params;
    
    try {
        const storageDir = path.join(rootPath, 'storage', 'RSpace_data');
        const metadataPath = path.join(storageDir, 'metadata.json');
        
        if (!fs.existsSync(metadataPath)) {
            return res.status(404).json({ type: 'NotFound', message: 'File metadata tidak ditemukan.' });
        }

        const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);

        if (!metadata[uniqueName]) {
            return res.status(404).json({ type: 'NotFound', message: 'Entri file tidak ditemukan di metadata.' });
        }

        const filePath = path.join(storageDir, uniqueName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        delete metadata[uniqueName];
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

        res.status(200).json({ message: `File ${uniqueName} berhasil dihapus.` });

    } catch (error) {
        next(error); // Teruskan error
    }
};