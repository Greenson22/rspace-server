// src/services/backup.service.ts

import path from 'path';
import fs from 'fs-extra';
// Impor helper yang diperlukan
import { getUserStoragePath } from '../config/path';

interface FileMetadata {
    uniqueName: string;
    originalName: string;
    createdAt: number; // Timestamp
}

/**
 * Helper function to read metadata and format file list from a user-specific storage.
 * @param userId - ID of the user whose backups to retrieve.
 * @param storageType - 'RSpace_data' or 'PerpusKu_data'
 */
const getBackupList = async (userId: number, storageType: 'RSpace_data' | 'PerpusKu_data'): Promise<any[]> => {
    // Gunakan getUserStoragePath untuk mendapatkan path yang benar
    const userStorageDir = getUserStoragePath(userId, storageType);
    const metadataPath = path.join(userStorageDir, 'metadata.json');

    if (!await fs.pathExists(metadataPath)) {
        return []; // Return array kosong jika metadata tidak ada
    }

    const metadata: FileMetadata[] = await fs.readJson(metadataPath);

    // Urutkan dari yang terbaru berdasarkan timestamp asli
    metadata.sort((a, b) => b.createdAt - a.createdAt);
    
    // Kembalikan fileList yang sudah diformat dan diurutkan
    return metadata.map(file => ({
        uniqueName: file.uniqueName,
        originalName: file.originalName,
        createdAt: new Date(file.createdAt).toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar',
            dateStyle: 'long',
            timeStyle: 'short',
        })
    }));
};

// Terima userId sebagai argumen
export const getRspaceBackups = async (userId: number) => {
    return getBackupList(userId, 'RSpace_data');
};

// Terima userId sebagai argumen
export const getPerpuskuBackups = async (userId: number) => {
    return getBackupList(userId, 'PerpusKu_data');
};