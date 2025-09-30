// src/services/archive.service.ts

import { Request } from 'express';
import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import { rootPath } from '../config/path';

export const archiveDiscussionsService = async (req: Request) => {
    if (!req.file) {
        throw new Error('File arsip .zip tidak ditemukan dalam permintaan.');
    }

    const archiveStorageDir = path.join(rootPath, 'storage', 'Archive_data');
    // Sekarang uploadedFilePath akan memiliki nilai string yang valid
    const uploadedFilePath = req.file.path; 

    try {
        console.log('Menghapus data arsip lama...');
        await fs.emptyDir(archiveStorageDir);

        console.log(`Mengekstrak file baru: ${req.file.originalname}`);
        const zip = new AdmZip(uploadedFilePath);
        zip.extractAllTo(archiveStorageDir, /*overwrite*/ true);
        
        console.log('Ekstraksi selesai.');

        return {
            message: 'Arsip berhasil diunggah dan menggantikan data lama di server!',
            originalName: req.file.originalname,
        };
    } catch (error) {
        console.error('Terjadi error selama proses arsip:', error);
        await fs.emptyDir(archiveStorageDir);
        throw new Error('Gagal memproses file arsip di server.');
    } finally {
        // Baris ini sekarang akan berjalan dengan aman
        await fs.remove(uploadedFilePath);
        console.log('File .zip temporer telah dihapus.');
    }
};

// ... sisa fungsi (getArchivedTopicsService, dll.) tidak perlu diubah ...
const archiveTopicsPath = path.join(rootPath, 'storage', 'Archive_data', 'RSpace_data', 'topics');

export const getArchivedTopicsService = async () => {
    if (!await fs.pathExists(archiveTopicsPath)) {
        return [];
    }
    const topicDirs = await fs.readdir(archiveTopicsPath);
    const topicsData = [];

    for (const topicName of topicDirs) {
        const topicConfigPath = path.join(archiveTopicsPath, topicName, 'topic_config.json');
        if (await fs.pathExists(topicConfigPath)) {
            const config = await fs.readJson(topicConfigPath);
            topicsData.push({ name: topicName, ...config });
        }
    }
    // Urutkan berdasarkan posisi
    topicsData.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
    return topicsData;
};

export const getArchivedSubjectsService = async (topicName: string) => {
    const topicPath = path.join(archiveTopicsPath, topicName);
    if (!await fs.pathExists(topicPath)) {
        throw new Error('Topik tidak ditemukan di arsip.');
    }
    const files = await fs.readdir(topicPath);
    const subjectsData = [];

    for (const fileName of files) {
        if (fileName.endsWith('.json') && fileName !== 'topic_config.json') {
            const subjectJson = await fs.readJson(path.join(topicPath, fileName));
            subjectsData.push({
                name: path.basename(fileName, '.json'),
                ...subjectJson.metadata
            });
        }
    }
     // Urutkan berdasarkan posisi
    subjectsData.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
    return subjectsData;
};

export const getArchivedDiscussionsService = async (topicName: string, subjectName: string) => {
    const subjectPath = path.join(archiveTopicsPath, topicName, `${subjectName}.json`);
    if (!await fs.pathExists(subjectPath)) {
        throw new Error('Subjek tidak ditemukan di arsip.');
    }
    const subjectJson = await fs.readJson(subjectPath);
    // Asumsi diskusi tidak memiliki urutan spesifik di dalam arsip
    return subjectJson.content || [];
};