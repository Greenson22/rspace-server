import { Request, Response, NextFunction } from 'express';
import * as sharingService from '../services/sharing.service';

export const getList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const folderPath = req.query.path as string || '';
        const items = await sharingService.listContentService(userId, folderPath);
        res.json(items);
    } catch (error) {
        next(error);
    }
};

export const createFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const { parentPath, folderName } = req.body;
        const result = await sharingService.createFolderService(userId, parentPath || '', folderName);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const itemPath = req.query.path as string;
        
        if (!itemPath) return res.status(400).json({message: "Path item diperlukan"});

        const result = await sharingService.deleteItemService(userId, itemPath);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const downloadItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const itemPath = req.query.path as string;

        if (!itemPath) return res.status(400).json({message: "Path file diperlukan"});

        const { filePath, fileName } = await sharingService.getDownloadPathService(userId, itemPath);
        
        res.download(filePath, fileName, (err) => {
            if (err) console.error("Error download:", err);
        });
    } catch (error) {
        // Jika error path traversal/not found, kirim json, jika header belum terkirim
        if (!res.headersSent) {
             const err = error as Error;
             res.status(400).json({ message: err.message });
        }
    }
};

export const handleUpload = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
    }
    res.status(201).json({ message: 'File berhasil diunggah.' });
};