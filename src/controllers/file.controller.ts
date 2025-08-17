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