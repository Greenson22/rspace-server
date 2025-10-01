// src/controllers/backup.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as backupService from '../services/backup.service';

export const listRspaceBackups = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Ambil userId dari request yang sudah diautentikasi oleh JWT
        const userId = req.user.userId;
        const files = await backupService.getRspaceBackups(userId);
        res.json(files);
    } catch (error) {
        next(error);
    }
};

export const listPerpuskuBackups = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Ambil userId dari request
        const userId = req.user.userId;
        const files = await backupService.getPerpuskuBackups(userId);
        res.json(files);
    } catch (error) {
        next(error);
    }
};