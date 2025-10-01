// src/services/rspace_download.service.ts

import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { rootPath } from '../config/path';

interface FileMetadata {
    uniqueName: string;
    originalName: string;
    createdAt: number;
}

export const downloadSrcService = () => {
    const sourceDir = path.join(rootPath, 'src');
    const zipFileName = 'src-archive.zip';
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.directory(sourceDir, false);
    
    return { archive, zipFileName };
};

// ## FUNGSI BARU DITAMBAHKAN ##
// Fungsi untuk membuat arsip dari folder client/src
export const downloadClientSrcService = () => {
    const sourceDir = path.join(rootPath, 'client', 'src'); // Path diubah ke client/src
    const zipFileName = 'client-src-archive.zip';
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.directory(sourceDir, false);
    
    return { archive, zipFileName };
};

export const downloadFileService = (uniqueName: string) => {
    const storageDir = path.join(rootPath, 'storage', 'RSpace_data');
    const metadataPath = path.join(storageDir, 'metadata.json');

    if (!fs.existsSync(metadataPath)) {
        throw new Error('File metadata tidak ditemukan.');
    }
    
    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
    const metadata: FileMetadata[] = JSON.parse(metadataContent);

    const fileData = metadata.find(file => file.uniqueName === uniqueName);
    if (!fileData) {
        throw new Error('File tidak ditemukan di dalam metadata.');
    }
    
    const filePath = path.join(storageDir, uniqueName);
    if (!fs.existsSync(filePath)) {
        throw new Error('File fisik tidak ditemukan di server.');
    }

    return { filePath, originalName: fileData.originalName };
};