// src/services/archive.service.ts

import { Request } from 'express';
import fs from 'fs-extra'; // <-- Gunakan fs-extra yang sudah diinstal
import path from 'path';
import AdmZip from 'adm-zip';
import { rootPath } from '../config/path';

// Definisikan interface untuk struktur data diskusi agar lebih aman
interface Discussion {
    discussion: string;
    // tambahkan properti lain jika perlu untuk validasi
}

interface SubjectJson {
    metadata: object;
    content: Discussion[];
}

/**
 * Fungsi utama yang menangani unggahan dan pemrosesan arsip.
 */
export const archiveDiscussionsService = async (req: Request) => {
    if (!req.file) {
        throw new Error('File arsip .zip tidak ditemukan dalam permintaan.');
    }

    const uploadDir = path.join(rootPath, 'storage', 'Archive_data');
    
    // ## PERBAIKAN: Hapus variabel tempFilePath yang tidak perlu ##
    // const tempFilePath = req.file.path; 
    
    const targetFilename = 'FinishedDiscussionsArchive.zip';
    const targetFilePath = path.join(uploadDir, targetFilename);
    const extractDir = path.join(uploadDir, 'extracted');

    // Pastikan direktori utama ada
    await fs.ensureDir(uploadDir);

    // ## PERBAIKAN: Baris ini tidak lagi diperlukan dan telah dihapus ##
    // await fs.move(tempFilePath, targetFilePath, { overwrite: true });

    // --- LOGIKA BARU: EKSTRAK DAN GABUNGKAN SECARA CERDAS ---

    // 1. Ekstrak ke folder temporer 'extracted'
    await fs.ensureDir(extractDir);
    try {
        const zip = new AdmZip(targetFilePath);
        zip.extractAllTo(extractDir, /*overwrite*/ true);
        console.log(`Arsip berhasil diekstrak ke: ${extractDir}`);
    } catch (error) {
        console.error('Gagal mengekstrak file arsip:', error);
        throw new Error('File berhasil diunggah, tetapi gagal diekstrak di server.');
    }

    // 2. Lakukan proses penggabungan
    const sourceRspaceDir = path.join(extractDir, 'RSpace_data', 'topics');
    const destRspaceDir = path.join(uploadDir, 'RSpace_data', 'topics');
    
    const sourcePerpuskuDir = path.join(extractDir, 'PerpusKu_data', 'topics');
    const destPerpuskuDir = path.join(uploadDir, 'PerpusKu_data', 'topics');

    if (await fs.pathExists(sourceRspaceDir)) {
        console.log('Memulai proses penggabungan data...');
        await mergeTopicData(sourceRspaceDir, destRspaceDir, sourcePerpuskuDir, destPerpuskuDir);
    }

    // 3. Hapus folder 'extracted' setelah selesai
    await fs.remove(extractDir);
    console.log('Folder ekstraksi temporer telah dihapus.');
    
    // --- AKHIR DARI LOGIKA BARU ---
    
    // Logika pembaruan metadata (tidak berubah)
    const metadataPath = path.join(uploadDir, 'metadata.json');
    const metadata = {
        lastUploadedAt: new Date().toISOString(),
        uploadedAtFormatted: new Date().toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar'
        })
    };
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });

    return {
        message: 'Arsip berhasil diunggah dan digabungkan di server!',
        fileName: targetFilename,
        originalName: req.file.originalname,
        path: targetFilePath
    };
};

/**
 * Menggabungkan data dari direktori sumber ke tujuan.
 */
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

            // Jika ini adalah file JSON (data subjek)
            if (fileName.endsWith('.json') && fileName !== 'topic_config.json') {
                await mergeSubjectFile(sourceFilePath, destFilePath, sourcePerpuskuPath, destPerpuskuPath);
            } 
            // Jika ini adalah file konfigurasi atau file lain yang tidak perlu digabung
            else {
                if (!await fs.pathExists(destFilePath)) {
                    await fs.copy(sourceFilePath, destFilePath);
                }
            }
        }
    }
}

/**
 * Menggabungkan konten dari satu file subjek JSON ke file tujuan.
 */
async function mergeSubjectFile(sourceJsonPath: string, destJsonPath: string, sourcePerpuskuBasePath: string, destPerpuskuBasePath: string) {
    const sourceData: SubjectJson = await fs.readJson(sourceJsonPath);

    // Jika file tujuan belum ada, cukup salin file sumber dan file HTML terkait
    if (!await fs.pathExists(destJsonPath)) {
        console.log(`File baru dibuat: ${path.basename(destJsonPath)}`);
        await fs.copy(sourceJsonPath, destJsonPath);
        // Salin juga folder PerpusKu-nya
        const subjectName = path.basename(sourceJsonPath, '.json');
        const topicName = path.basename(path.dirname(sourceJsonPath));
        const sourceHtmlDir = path.join(sourcePerpuskuBasePath, topicName, subjectName);
        const destHtmlDir = path.join(destPerpuskuBasePath, topicName, subjectName);
        if (await fs.pathExists(sourceHtmlDir)) {
            await fs.copy(sourceHtmlDir, destHtmlDir);
        }
        return;
    }

    // Jika file tujuan sudah ada, lakukan penggabungan
    const destData: SubjectJson = await fs.readJson(destJsonPath);
    const existingDiscussionNames = new Set(destData.content.map(d => d.discussion));
    let newDiscussionsAdded = 0;

    for (const newDiscussion of sourceData.content) {
        if (!existingDiscussionNames.has(newDiscussion.discussion)) {
            destData.content.push(newDiscussion);
            existingDiscussionNames.add(newDiscussion.discussion);
            newDiscussionsAdded++;

            // Salin file HTML terkait jika ada
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
        // Simpan kembali file JSON yang sudah digabung
        await fs.writeJson(destJsonPath, destData, { spaces: 2 });
    }
}