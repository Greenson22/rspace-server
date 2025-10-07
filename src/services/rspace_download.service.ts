// src/services/rspace_download.service.ts

import archiver from 'archiver';
import path from 'path';
import fs from 'fs-extra'; // Gunakan fs-extra untuk operasi async
import { getUserStoragePath } from '../config/path'; // Import helper path pengguna

interface FileMetadata {
    uniqueName: string;
    originalName: string;
    createdAt: number;
}

export const downloadSrcService = () => {
    const sourceDir = path.join(getUserStoragePath(1, 'Archive_data'), 'src'); // Contoh path, sesuaikan jika perlu
    const zipFileName = 'src-archive.zip';
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.directory(sourceDir, false);
    return { archive, zipFileName };
};

export const downloadClientSrcService = () => {
    const sourceDir = path.join(getUserStoragePath(1, 'Archive_data'), 'client', 'src');
    const zipFileName = 'client-src-archive.zip';
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.directory(sourceDir, false);
    return { archive, zipFileName };
};

// ==> FUNGSI INI DIPERBARUI TOTAL MENJADI ASYNC DAN MENGGUNAKAN PATH PENGGUNA <==
export const downloadFileService = async (userId: number, uniqueName: string) => {
    // Dapatkan path penyimpanan RSpace khusus untuk pengguna ini
    const userRspacePath = getUserStoragePath(userId, 'RSpace_data');
    const metadataPath = path.join(userRspacePath, 'metadata.json');

    if (!await fs.pathExists(metadataPath)) {
        throw new Error('File metadata tidak ditemukan.');
    }
    
    const metadata: FileMetadata[] = await fs.readJson(metadataPath);

    const fileData = metadata.find(file => file.uniqueName === uniqueName);
    if (!fileData) {
        throw new Error('File tidak ditemukan di dalam metadata.');
    }
    
    const filePath = path.join(userRspacePath, uniqueName);
    if (!await fs.pathExists(filePath)) {
        throw new Error('File fisik tidak ditemukan di server.');
    }

    return { filePath, originalName: fileData.originalName };
};