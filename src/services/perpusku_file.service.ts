import path from 'path';
import fs from 'fs';
import { rootPath } from '../config/path';

interface FileMetadata {
    uniqueName: string;
    originalName: string;
    createdAt: number;
}

const metadataPath = path.join(rootPath, 'storage', 'PerpusKu_data', 'metadata.json');

export const getFileListService = () => {
    if (!fs.existsSync(metadataPath)) {
        return [];
    }

    const fileContent = fs.readFileSync(metadataPath, 'utf-8');
    const metadata: FileMetadata[] = JSON.parse(fileContent);

    const fileListWithDate = metadata.map(file => ({
        ...file,
        uploadedAt: new Date(file.createdAt).toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar'
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
        ...fileData,
        uploadedAt: new Date(fileData.createdAt).toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar'
        })
    };
};

export const deleteFileService = (uniqueName: string) => {
    const storageDir = path.join(rootPath, 'storage', 'PerpusKu_data');

    if (!fs.existsSync(metadataPath)) {
        throw new Error('File metadata tidak ditemukan.');
    }

    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
    let metadata: FileMetadata[] = JSON.parse(metadataContent);

    const fileIndex = metadata.findIndex(file => file.uniqueName === uniqueName);

    if (fileIndex === -1) {
        throw new Error('Entri file tidak ditemukan di metadata.');
    }

    const filePath = path.join(storageDir, uniqueName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    metadata.splice(fileIndex, 1);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
};