// src/controllers/discussion_file.controller.ts

import { Request, Response, NextFunction } from 'express';
import { getDiscussionMetadataService } from '../services/discussion_file.service';

export const getDiscussionMetadata = (req: Request, res: Response, next: NextFunction) => {
    try {
        const metadata = getDiscussionMetadataService();
        if (!metadata) {
            // Kirim respons yang jelas jika belum ada metadata
            return res.status(404).json({ message: 'Belum ada file diskusi yang diunggah.' });
        }
        res.status(200).json(metadata);
    } catch (error) {
        next(error);
    }
};