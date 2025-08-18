import path from 'path';
import fs from 'fs';
import { rootPath } from '../config/path';

interface FileMetadata {
    uniqueName: string;
    originalName: string;
    createdAt: number;
}

const storageDir = path.join(rootPath, 'storage', 'RSpace_data');
const metadataPath = path.join(storageDir, 'metadata.json');

export const getFileListService = () => {
    if (!fs.existsSync(metadataPath)) {
        return [];
    }

    const fileContent = fs.readFileSync(metadataPath, 'utf-8');
    const metadata: FileMetadata[] = JSON.parse(fileContent);

    const fileListWithDate = metadata.map(file => ({
        uniqueName: file.uniqueName,
        originalName: file.originalName,
        createdAt: file.createdAt,
        uploadedAt: new Date(file.createdAt).toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
    }));
    
    fileListWithDate.sort((a, b) => b.createdAt - a.createdAt);
    return fileListWithDate;
};

export const getFileDetailService = (uniqueName: string) => {
    if (!fs.existsSync(metadataPath)) {
        return null;
    }

    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
    const metadata: FileMetadata[] = JSON.parse(metadataContent);

    const fileData = metadata.find(file => file.uniqueName === uniqueName);

    if (!fileData) {
        return null;
    }
    
    return {
        uniqueName: fileData.uniqueName,
        originalName: fileData.originalName,
        createdAt: fileData.createdAt,
        uploadedAt: new Date(fileData.createdAt).toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
    };
};

export const deleteFileService = (uniqueName: string) => {
    if (!fs.existsSync(metadataPath)) {
        throw new Error('File metadata tidak ditemukan.');
    }

    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
    let metadata: FileMetadata[] = JSON.parse(metadataContent);

    const fileIndex = metadata.findIndex(file => file.uniqueName === uniqueName);

    if (fileIndex === -1) {
        throw new Error('Entri file tidak ditemukan di metadata.');
    }

    // Perbaikan: `uniqueName` dari metadata sudah berisi ekstensi .zip
    const filePath = path.join(storageDir, uniqueName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    metadata.splice(fileIndex, 1);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
};