// src/services/backup.service.ts

import path from 'path';
import fs from 'fs-extra';
import { rootPath } from '../config/path';

interface FileMetadata {
    uniqueName: string;
    originalName: string;
    createdAt: number; // Timestamp
}

/**
 * Helper function to read metadata and format file list.
 * @param storageType - 'RSpace_data' or 'PerpusKu_data'
 */
const getBackupList = async (storageType: 'RSpace_data' | 'PerpusKu_data'): Promise<any[]> => {
    const metadataPath = path.join(rootPath, 'storage', storageType, 'metadata.json');

    if (!await fs.pathExists(metadataPath)) {
        return []; // Return array kosong jika metadata tidak ada
    }

    const metadata: FileMetadata[] = await fs.readJson(metadataPath);

    const fileList = metadata.map(file => ({
        uniqueName: file.uniqueName,
        originalName: file.originalName,
        createdAt: new Date(file.createdAt).toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar',
            dateStyle: 'long',
            timeStyle: 'short',
        })
    }));

    // Urutkan dari yang terbaru berdasarkan timestamp asli, bukan string tanggal
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

export const getRspaceBackups = async () => {
    return getBackupList('RSpace_data');
};

export const getPerpuskuBackups = async () => {
    return getBackupList('PerpusKu_data');
};