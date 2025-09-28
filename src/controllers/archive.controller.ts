// src/controllers/archive.controller.ts

import { Request, Response, NextFunction } from 'express';
import { archiveDiscussionsService } from '../services/archive.service';

export const handleArchiveUpload = (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = archiveDiscussionsService(req);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};