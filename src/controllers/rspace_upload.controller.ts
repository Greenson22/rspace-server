import { Request, Response } from 'express';
import { uploadFileService } from '../services/rspace_upload.service';

export const handleUpload = (req: Request, res: Response) => {
    try {
        const result = uploadFileService(req);
        res.status(201).json(result);
    } catch (error) {
        const err = error as Error;
        res.status(400).json({ message: err.message });
    }
};