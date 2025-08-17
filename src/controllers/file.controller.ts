// src/controllers/file.controller.ts

import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { rootPath } from '../config/path';

export const getFileList = (req: Request, res: Response) => {
    const metadataPath = path.join(rootPath, 'storage', 'RSpace_data', 'metadata.json');

    try {
        // Cek apakah file metadata ada
        if (!fs.existsSync(metadataPath)) {
            // Jika tidak ada, kembalikan array kosong
            return res.status(200).json([]);
        }

        const fileContent = fs.readFileSync(metadataPath, 'utf-8');
        const metadata = JSON.parse(fileContent);

        // Ubah format objek menjadi array objek agar lebih mudah digunakan di frontend
        const fileList = Object.keys(metadata).map(uniqueName => {
            return {
                uniqueName: uniqueName,
                originalName: metadata[uniqueName]
            };
        });

        res.status(200).json(fileList);

    } catch (error) {
        console.error('Gagal membaca file metadata:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil daftar file.' });
    }
};

// ▼▼▼ FUNGSI BARU DITAMBAHKAN DI SINI ▼▼▼
export const deleteFile = (req: Request, res: Response) => {
    const { uniqueName } = req.params;
    const storageDir = path.join(rootPath, 'storage', 'RSpace_data');
    const metadataPath = path.join(storageDir, 'metadata.json');

    try {
        // 1. Validasi metadata dan keberadaan file
        if (!fs.existsSync(metadataPath)) {
            return res.status(404).json({ message: 'File metadata tidak ditemukan.' });
        }

        const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);

        if (!metadata[uniqueName]) {
            return res.status(404).json({ message: 'File tidak ditemukan di dalam metadata.' });
        }

        // 2. Hapus file fisik
        const filePath = path.join(storageDir, uniqueName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            console.warn(`Peringatan: File fisik ${uniqueName} tidak ditemukan, tetapi entri metadata akan tetap dihapus.`);
        }

        // 3. Hapus entri dari objek metadata
        delete metadata[uniqueName];

        // 4. Tulis kembali metadata yang sudah diperbarui
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

        res.status(200).json({ message: `File ${uniqueName} berhasil dihapus.` });

    } catch (error) {
        console.error('Gagal menghapus file:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};