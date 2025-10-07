// src/services/perpusku_download.service.ts

import path from 'path';
import fs from 'fs-extra'; // Gunakan fs-extra untuk operasi async
import { getUserStoragePath } from '../config/path'; // Import helper path pengguna

interface FileMetadata {
    uniqueName: string;
    originalName: string;
    createdAt: number;
}

// ==> FUNGSI INI DIPERBARUI TOTAL MENJADI ASYNC DAN MENGGUNAKAN PATH PENGGUNA <==
export const downloadFileService = async (userId: number, uniqueName: string) => {
    // Dapatkan path penyimpanan PerpusKu khusus untuk pengguna ini
    const userPerpuskuPath = getUserStoragePath(userId, 'PerpusKu_data');
    const metadataPath = path.join(userPerpuskuPath, 'metadata.json');

    if (!await fs.pathExists(metadataPath)) {
        throw new Error('File metadata tidak ditemukan.');
    }

    const metadata: FileMetadata[] = await fs.readJson(metadataPath);
    const fileData = metadata.find(file => file.uniqueName === uniqueName);
    
    if (!fileData) {
        throw new Error('File tidak ditemukan di dalam metadata.');
    }

    const filePath = path.join(userPerpuskuPath, fileData.uniqueName);
    if (!await fs.pathExists(filePath)) {
        throw new Error('File fisik tidak ditemukan di server.');
    }

    return { filePath, originalName: fileData.originalName };
};