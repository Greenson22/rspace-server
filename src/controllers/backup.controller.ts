// src/controllers/backup.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as backupService from '../services/backup.service';

export const listRspaceBackups = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = await backupService.getRspaceBackups();
        res.json(files);
    } catch (error) {
        next(error);
    }
};

export const listPerpuskuBackups = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = await backupService.getPerpuskuBackups();
        res.json(files);
    } catch (error) {
        next(error);
    }
};