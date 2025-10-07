// src/controllers/rspace_file.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as fileService from '../services/rspace_file.service';

export const getFileList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Ambil userId dari request yang sudah diautentikasi
        const userId = req.user.userId;
        const fileList = await fileService.getFileListService(userId);
        res.status(200).json(fileList);
    } catch (error) {
        next(error);
    }
};

export const getFileDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const { uniqueName } = req.params;
        const fileData = await fileService.getFileDetailService(userId, uniqueName);
        if (!fileData) {
            return res.status(404).json({ message: 'File tidak ditemukan.' });
        }
        res.status(200).json(fileData);
    } catch (error) {
        next(error);
    }
};

export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const { uniqueName } = req.params;
        await fileService.deleteFileService(userId, uniqueName);
        res.status(200).json({ message: `File ${uniqueName} berhasil dihapus.` });
    } catch (error) {
        next(error);
    }
};