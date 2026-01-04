import path from 'path';
import fs from 'fs-extra';
import { getUserStoragePath } from '../config/path';

interface FileItem {
    name: string;
    type: 'file' | 'folder';
    size?: number;
    updatedAt: Date;
}

// Helper untuk mencegah Path Traversal (keamanan)
const getSafePath = (userId: number, relativePath: string = '') => {
    const rootSharingPath = getUserStoragePath(userId, 'sharing');
    // Normalisasi path dan gabungkan
    const fullPath = path.join(rootSharingPath, relativePath);
    
    // Pastikan path yang diminta masih berada di dalam root sharing user
    if (!fullPath.startsWith(rootSharingPath)) {
        throw new Error('Akses ditolak: Path tidak valid.');
    }
    return { rootSharingPath, fullPath };
};

export const listContentService = async (userId: number, folderPath: string = '') => {
    const { fullPath } = getSafePath(userId, folderPath);

    if (!await fs.pathExists(fullPath)) {
        return [];
    }

    const items = await fs.readdir(fullPath, { withFileTypes: true });
    
    const result: FileItem[] = await Promise.all(items.map(async (item) => {
        const itemPath = path.join(fullPath, item.name);
        const stats = await fs.stat(itemPath);
        
        return {
            name: item.name,
            type: item.isDirectory() ? 'folder' : 'file',
            size: item.isDirectory() ? 0 : stats.size,
            updatedAt: stats.mtime
        };
    }));

    // Urutkan: Folder dulu, baru file
    return result.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
    });
};

export const createFolderService = async (userId: number, parentPath: string, folderName: string) => {
    // Validasi nama folder (hanya huruf, angka, strip, underscore)
    if (!folderName.match(/^[a-zA-Z0-9_\-\s]+$/)) {
        throw new Error('Nama folder mengandung karakter yang tidak diizinkan.');
    }

    const { fullPath } = getSafePath(userId, path.join(parentPath, folderName));

    if (await fs.pathExists(fullPath)) {
        throw new Error('Folder sudah ada.');
    }

    await fs.mkdir(fullPath);
    return { message: 'Folder berhasil dibuat.' };
};

export const deleteItemService = async (userId: number, itemPath: string) => {
    const { fullPath } = getSafePath(userId, itemPath);
    
    if (!await fs.pathExists(fullPath)) {
        throw new Error('Item tidak ditemukan.');
    }

    await fs.remove(fullPath);
    return { message: 'Item berhasil dihapus.' };
};

export const getDownloadPathService = async (userId: number, itemPath: string) => {
    const { fullPath } = getSafePath(userId, itemPath);

    if (!await fs.pathExists(fullPath)) {
        throw new Error('File tidak ditemukan.');
    }
    
    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
        throw new Error('Tidak dapat mengunduh folder secara langsung.');
    }

    return { filePath: fullPath, fileName: path.basename(fullPath) };
};