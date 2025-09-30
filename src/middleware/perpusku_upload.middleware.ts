// src/middleware/perpusku_upload.middleware.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getUserStoragePath } from '../config/path'; // <-- Import helper path

// Interface untuk struktur metadata
interface FileMetadata {
    uniqueName: string;
    originalName: string;
    createdAt: number;
}

// Fungsi untuk memperbarui metadata di dalam folder pengguna
const updateMetadata = async (userId: number, uniqueName: string, originalName: string) => {
    try {
        const userPerpuskuPath = getUserStoragePath(userId, 'PerpusKu_data');
        const metadataPath = path.join(userPerpuskuPath, 'metadata.json');
        
        let metadata: FileMetadata[] = [];
        if (await fs.pathExists(metadataPath)) {
            metadata = await fs.readJson(metadataPath);
        }

        // Hapus file terlama jika sudah ada 5 file atau lebih
        if (metadata.length >= 5) {
            metadata.sort((a, b) => a.createdAt - b.createdAt);
            const oldestFile = metadata.shift();

            if (oldestFile) {
                const filePath = path.join(userPerpuskuPath, oldestFile.uniqueName);
                if (await fs.pathExists(filePath)) {
                    await fs.remove(filePath);
                    console.log(`File PerpusKu terlama untuk user ${userId} dihapus: ${oldestFile.originalName}`);
                }
            }
        }

        metadata.push({ uniqueName, originalName, createdAt: Date.now() });
        await fs.writeJson(metadataPath, metadata, { spaces: 2 });

    } catch (error) {
        console.error(`Gagal memperbarui metadata PerpusKu untuk user ${userId}:`, error);
    }
};

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const userId = req.user?.userId;
        if (!userId) {
            return cb(new Error('Autentikasi gagal, ID pengguna tidak ditemukan.'), '');
        }
        // Simpan file ke direktori PerpusKu milik pengguna
        const userPerpuskuPath = getUserStoragePath(userId, 'PerpusKu_data');
        cb(null, userPerpuskuPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        if (!file.originalname.match(/\.zip$/)) {
            return cb(new Error('Hanya file .zip yang diizinkan!'), '');
        }
        const userId = req.user?.userId;
        if (!userId) {
            return cb(new Error('Autentikasi gagal, ID pengguna tidak ditemukan.'), '');
        }

        const newFilename = `${uuidv4()}${path.extname(file.originalname)}`;
        
        updateMetadata(userId, newFilename, file.originalname);

        cb(null, newFilename);
    }
});

export const upload = multer({ storage: storage });