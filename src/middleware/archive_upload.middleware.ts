// src/middleware/archive_upload.middleware.ts

import multer from 'multer';
import { Request } from 'express';

// Gunakan memoryStorage untuk menyimpan file di RAM sebagai buffer
const storage = multer.memoryStorage();

// Filter untuk memastikan hanya file .zip yang diterima
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.originalname.match(/\.zip$/)) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file .zip yang diizinkan!'));
    }
};

export const upload = multer({ storage: storage, fileFilter: fileFilter });