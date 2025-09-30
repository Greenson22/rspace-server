// src/services/archive.service.ts

import { Request } from 'express';
import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import { rootPath } from '../config/path';

// ... (Interface Discussion dan SubjectJson tetap sama) ...
interface Discussion {
    discussion: string;
    // tambahkan properti lain jika perlu untuk validasi
}

interface SubjectJson {
    metadata: object;
    content: Discussion[];
}


// ... (Fungsi archiveDiscussionsService tetap sama) ...
export const archiveDiscussionsService = async (req: Request) => {
    if (!req.file) {
        throw new Error('File arsip .zip tidak ditemukan dalam permintaan.');
    }

    const uploadDir = path.join(rootPath, 'storage', 'Archive_data');
    const targetFilename = 'FinishedDiscussionsArchive.zip';
    const targetFilePath = path.join(uploadDir, targetFilename);
    const extractDir = path.join(uploadDir, 'extracted');

    await fs.ensureDir(uploadDir);

    // ... (sisa logika upload tidak berubah)
    if (await fs.pathExists(targetFilePath)) {
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
        const archiveBackupFilename = `Archive_backup_${timestamp}.zip`;
        const archiveBackupPath = path.join(uploadDir, archiveBackupFilename);
        
        await fs.rename(targetFilePath, archiveBackupPath);
        console.log(`Arsip lama disimpan sebagai: ${archiveBackupFilename}`);
    }

    await fs.move(req.file.path, targetFilePath, { overwrite: true });

    await fs.ensureDir(extractDir);
    try {
        const zip = new AdmZip(targetFilePath);
        zip.extractAllTo(extractDir, /*overwrite*/ true);
        console.log(`Arsip berhasil diekstrak ke: ${extractDir}`);
    } catch (error) {
        console.error('Gagal mengekstrak file arsip:', error);
        throw new Error('File berhasil diunggah, tetapi gagal diekstrak di server.');
    }

    const sourceRspaceDir = path.join(extractDir, 'RSpace_data', 'topics');
    const destRspaceDir = path.join(uploadDir, 'RSpace_data', 'topics');
    
    const sourcePerpuskuDir = path.join(extractDir, 'PerpusKu_data', 'topics');
    const destPerpuskuDir = path.join(uploadDir, 'PerpusKu_data', 'topics');

    if (await fs.pathExists(sourceRspaceDir)) {
        console.log('Memulai proses penggabungan data...');
        await mergeTopicData(sourceRspaceDir, destRspaceDir, sourcePerpuskuDir, destPerpuskuDir);
    }

    await fs.remove(extractDir);
    console.log('Folder ekstraksi temporer telah dihapus.');
    
    const metadataPath = path.join(uploadDir, 'metadata.json');
    const metadata = {
        lastUploadedAt: new Date().toISOString(),
        uploadedAtFormatted: new Date().toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar'
        })
    };
    await fs.writeJson(metadataPath, { spaces: 2 });

    return {
        message: 'Arsip berhasil diunggah dan digabungkan di server!',
        fileName: targetFilename,
        originalName: req.file.originalname,
        path: targetFilePath
    };
};


// --- FUNGSI BARU UNTUK MENGAMBIL DATA ARSIP ---

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
    return subjectsData;
};

export const getArchivedDiscussionsService = async (topicName: string, subjectName: string) => {
    const subjectPath = path.join(archiveTopicsPath, topicName, `${subjectName}.json`);
    if (!await fs.pathExists(subjectPath)) {
        throw new Error('Subjek tidak ditemukan di arsip.');
    }
    const subjectJson = await fs.readJson(subjectPath);
    return subjectJson.content || [];
};

// ... (Fungsi mergeTopicData dan mergeSubjectFile tetap sama) ...
async function mergeTopicData(sourceTopicsPath: string, destTopicsPath: string, sourcePerpuskuPath: string, destPerpuskuPath: string) {
    await fs.ensureDir(destTopicsPath);
    const topicDirs = await fs.readdir(sourceTopicsPath);

    for (const topicName of topicDirs) {
        const sourceTopicDir = path.join(sourceTopicsPath, topicName);
        const destTopicDir = path.join(destTopicsPath, topicName);
        await fs.ensureDir(destTopicDir);

        const files = await fs.readdir(sourceTopicDir);
        for (const fileName of files) {
            const sourceFilePath = path.join(sourceTopicDir, fileName);
            const destFilePath = path.join(destTopicDir, fileName);

            if (fileName.endsWith('.json') && fileName !== 'topic_config.json') {
                await mergeSubjectFile(sourceFilePath, destFilePath, sourcePerpuskuPath, destPerpuskuPath);
            } 
            else {
                if (!await fs.pathExists(destFilePath)) {
                    await fs.copy(sourceFilePath, destFilePath);
                }
            }
        }
    }
}
async function mergeSubjectFile(sourceJsonPath: string, destJsonPath: string, sourcePerpuskuBasePath: string, destPerpuskuBasePath: string) {
    const sourceData: SubjectJson = await fs.readJson(sourceJsonPath);

    if (!await fs.pathExists(destJsonPath)) {
        console.log(`File baru dibuat: ${path.basename(destJsonPath)}`);
        await fs.copy(sourceJsonPath, destJsonPath);
        const subjectName = path.basename(sourceJsonPath, '.json');
        const topicName = path.basename(path.dirname(sourceJsonPath));
        const sourceHtmlDir = path.join(sourcePerpuskuBasePath, topicName, subjectName);
        const destHtmlDir = path.join(destPerpuskuBasePath, topicName, subjectName);
        if (await fs.pathExists(sourceHtmlDir)) {
            await fs.copy(sourceHtmlDir, destHtmlDir);
        }
        return;
    }

    const destData: SubjectJson = await fs.readJson(destJsonPath);
    const existingDiscussionNames = new Set(destData.content.map(d => d.discussion));
    let newDiscussionsAdded = 0;

    for (const newDiscussion of sourceData.content) {
        if (!existingDiscussionNames.has(newDiscussion.discussion)) {
            destData.content.push(newDiscussion);
            existingDiscussionNames.add(newDiscussion.discussion);
            newDiscussionsAdded++;

            const htmlPath = (newDiscussion as any).filePath;
            if (htmlPath) {
                const sourceHtmlPath = path.join(sourcePerpuskuBasePath, htmlPath);
                const destHtmlPath = path.join(destPerpuskuBasePath, htmlPath);
                if (await fs.pathExists(sourceHtmlPath)) {
                    await fs.ensureDir(path.dirname(destHtmlPath));
                    await fs.copy(sourceHtmlPath, destHtmlPath);
                }
            }
        }
    }

    if (newDiscussionsAdded > 0) {
        console.log(`${newDiscussionsAdded} diskusi baru ditambahkan ke ${path.basename(destJsonPath)}`);
        await fs.writeJson(destJsonPath, destData, { spaces: 2 });
    }
}