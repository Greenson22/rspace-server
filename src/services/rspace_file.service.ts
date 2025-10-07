// src/services/rspace_file.service.ts

import path from 'path';
import fs from 'fs-extra';
import { getUserStoragePath } from '../config/path';

interface FileMetadata {
    uniqueName: string;
    originalName: string;
    createdAt: number;
}

// ==> FUNGSI DIPERBARUI: Menerima userId <==
export const getFileListService = async (userId: number) => {
    // Gunakan helper untuk mendapatkan path direktori RSpace milik user
    const userRspacePath = getUserStoragePath(userId, 'RSpace_data');
    const metadataPath = path.join(userRspacePath, 'metadata.json');

    if (!await fs.pathExists(metadataPath)) {
        return [];
    }

    const metadata: FileMetadata[] = await fs.readJson(metadataPath);

    const fileListWithDate = metadata.map(file => ({
        ...file,
        uploadedAt: new Date(file.createdAt).toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar'
        })
    }));

    fileListWithDate.sort((a, b) => b.createdAt - a.createdAt);
    return fileListWithDate;
};

// ==> FUNGSI DIPERBARUI: Menerima userId <==
export const getFileDetailService = async (userId: number, uniqueName: string) => {
    const userRspacePath = getUserStoragePath(userId, 'RSpace_data');
    const metadataPath = path.join(userRspacePath, 'metadata.json');
    
    if (!await fs.pathExists(metadataPath)) {
        return null;
    }

    const metadata: FileMetadata[] = await fs.readJson(metadataPath);
    const fileData = metadata.find(file => file.uniqueName === uniqueName);

    if (!fileData) {
        return null;
    }

    return {
        ...fileData,
        uploadedAt: new Date(fileData.createdAt).toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar'
        })
    };
};

// ==> FUNGSI DIPERBARUI: Menerima userId <==
export const deleteFileService = async (userId: number, uniqueName: string) => {
    const userRspacePath = getUserStoragePath(userId, 'RSpace_data');
    const metadataPath = path.join(userRspacePath, 'metadata.json');

    if (!await fs.pathExists(metadataPath)) {
        throw new Error('File metadata tidak ditemukan.');
    }

    let metadata: FileMetadata[] = await fs.readJson(metadataPath);
    const fileIndex = metadata.findIndex(file => file.uniqueName === uniqueName);

    if (fileIndex === -1) {
        throw new Error('Entri file tidak ditemukan di metadata.');
    }

    const filePath = path.join(userRspacePath, uniqueName);
    if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
    }

    metadata.splice(fileIndex, 1);
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });
};