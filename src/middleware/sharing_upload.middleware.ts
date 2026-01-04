import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { getUserStoragePath } from '../config/path';
import fs from 'fs-extra';

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const userId = req.user?.userId;
        // Ambil path folder tujuan dari Query Parameter (misal: ?path=FolderA/SubFolder)
        const relativePath = req.query.path as string || '';

        if (!userId) {
            return cb(new Error('Autentikasi gagal.'), '');
        }

        const rootSharingPath = getUserStoragePath(userId, 'sharing');
        const targetPath = path.join(rootSharingPath, relativePath);

        // Keamanan: Pastikan target path valid
        if (!targetPath.startsWith(rootSharingPath)) {
             return cb(new Error('Path upload tidak valid.'), '');
        }

        // Pastikan folder tujuan ada (walaupun harusnya sudah ada)
        fs.ensureDirSync(targetPath);
        
        cb(null, targetPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Simpan dengan nama asli. Jika ada konflik nama, multer defaultnya akan menimpa.
        // Anda bisa menambahkan timestamp jika ingin menghindari overwrite.
        cb(null, file.originalname);
    }
});

export const uploadSharing = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // Batas 50MB (sesuaikan kebutuhan)
});