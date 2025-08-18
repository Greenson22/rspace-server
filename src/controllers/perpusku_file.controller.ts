import { Request, Response, NextFunction } from 'express';
import { getFileListService, getFileDetailService, deleteFileService } from '../services/perpusku_file.service';

export const getFileList = (req: Request, res: Response, next: NextFunction) => {
    try {
        const fileList = getFileListService();
        res.status(200).json(fileList);
    } catch (error) {
        next(error);
    }
};

export const getFileDetail = (req: Request, res: Response, next: NextFunction) => {
    const { uniqueName } = req.params;
    try {
        const fileData = getFileDetailService(uniqueName);
        if (!fileData) {
            return res.status(404).json({ type: 'NotFound', message: 'File tidak ditemukan.' });
        }
        res.status(200).json(fileData);
    } catch (error) {
        next(error);
    }
};

export const deleteFile = (req: Request, res: Response, next: NextFunction) => {
    const { uniqueName } = req.params;
    try {
        deleteFileService(uniqueName);
        res.status(200).json({ message: `File ${uniqueName} berhasil dihapus.` });
    } catch (error) {
        const err = error as Error
        if (err.message.includes('metadata')) {
            return res.status(404).json({ type: 'NotFound', message: err.message });
        }
        next(error);
    }
};