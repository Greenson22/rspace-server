// src/services/archive.service.ts

import { Request } from 'express';
import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import { rootPath, getUserStoragePath } from '../config/path';

// Interface untuk struktur data diskusi
interface Discussion {
    discussion: string;
}

interface SubjectJson {
    metadata: object;
    content: Discussion[];
}

/**
 * Fungsi utama yang menangani unggahan dan pemrosesan arsip.
 * Logika diubah untuk beroperasi di dalam direktori spesifik pengguna.
 */
export const archiveDiscussionsService = async (req: Request) => {
    if (!req.file) {
        throw new Error('File arsip .zip tidak ditemukan dalam permintaan.');
    }
    if (!req.user || !req.user.userId) {
        throw new Error('Autentikasi gagal, ID pengguna tidak ditemukan.');
    }

    const userId = req.user.userId;
    const userArchiveStorageDir = getUserStoragePath(userId, 'Archive_data');
    const uploadedFilePath = req.file.path;

    try {
        console.log(`Menghapus data arsip lama untuk user ID: ${userId}...`);
        await fs.emptyDir(userArchiveStorageDir);

        console.log(`Mengekstrak file baru untuk user ID: ${userId}...`);
        const zip = new AdmZip(uploadedFilePath);
        zip.extractAllTo(userArchiveStorageDir, true);
        
        console.log('Ekstraksi selesai.');

        return {
            message: 'Arsip berhasil diunggah dan menggantikan data lama di server!',
            originalName: req.file.originalname,
        };
    } catch (error) {
        console.error(`Terjadi error selama proses arsip untuk user ID ${userId}:`, error);
        await fs.emptyDir(userArchiveStorageDir);
        throw new Error('Gagal memproses file arsip di server.');
    } finally {
        await fs.remove(uploadedFilePath);
        console.log(`File .zip temporer untuk user ID ${userId} telah dihapus.`);
    }
};

// --- FUNGSI PENGAMBILAN DATA ARSIP ---

export const getArchivedTopicsService = async (userId: number) => {
    const userTopicsPath = path.join(getUserStoragePath(userId, 'Archive_data'), 'RSpace_data', 'topics');
    
    if (!await fs.pathExists(userTopicsPath)) {
        return [];
    }
    const topicDirs = await fs.readdir(userTopicsPath);
    const topicsData = [];

    for (const topicName of topicDirs) {
        const topicDirFullPath = path.join(userTopicsPath, topicName);
        const stats = await fs.stat(topicDirFullPath);
        if (stats.isDirectory()) {
            const topicConfigPath = path.join(topicDirFullPath, 'topic_config.json');
            if (await fs.pathExists(topicConfigPath)) {
                const config = await fs.readJson(topicConfigPath);
                topicsData.push({ name: topicName, ...config });
            }
        }
    }
    
    topicsData.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
    return topicsData;
};

export const getArchivedSubjectsService = async (userId: number, topicName: string) => {
    const userTopicPath = path.join(getUserStoragePath(userId, 'Archive_data'), 'RSpace_data', 'topics', topicName);
    
    if (!await fs.pathExists(userTopicPath)) {
        throw new Error('Topik tidak ditemukan di arsip.');
    }
    const files = await fs.readdir(userTopicPath);
    const subjectsData = [];

    for (const fileName of files) {
        if (fileName.endsWith('.json') && fileName !== 'topic_config.json') {
            const subjectJson = await fs.readJson(path.join(userTopicPath, fileName));
            subjectsData.push({
                name: path.basename(fileName, '.json'),
                ...(subjectJson.metadata || {})
            });
        }
    }
    
    subjectsData.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
    return subjectsData;
};

export const getArchivedDiscussionsService = async (userId: number, topicName: string, subjectName: string) => {
    const userSubjectPath = path.join(getUserStoragePath(userId, 'Archive_data'), 'RSpace_data', 'topics', topicName, `${subjectName}.json`);
    
    if (!await fs.pathExists(userSubjectPath)) {
        throw new Error('Subjek tidak ditemukan di arsip.');
    }
    const subjectJson = await fs.readJson(userSubjectPath);
    return subjectJson.content || [];
};

/**
 * Mendapatkan path file fisik dari sebuah file HTML di dalam arsip pengguna.
 * @param userId - ID pengguna yang sedang login.
 * @param relativePath - Path relatif file seperti yang tersimpan di data discussion (e.g., "Topic/Subject/file.html").
 * @returns Object berisi path absolut ke file dan nama file aslinya.
 */
export const getArchivedFileService = async (userId: number, relativePath: string) => {
    const perpuskuArchivePath = path.join(getUserStoragePath(userId, 'Archive_data'), 'PerpusKu_data', 'topics');
    const filePath = path.join(perpuskuArchivePath, relativePath);

    if (!await fs.pathExists(filePath)) {
        throw new Error('File tidak ditemukan di dalam arsip server.');
    }

    return {
        filePath,
        originalName: path.basename(filePath)
    };
};