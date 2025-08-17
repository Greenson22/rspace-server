import { Request, Response } from 'express';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { rootPath } from '../config/path';

export const handleDownloadSrc = (req: Request, res: Response) => {
    const sourceDir = path.join(rootPath, 'src');
    const zipFileName = 'src-archive.zip';

    // Set header agar browser tahu ini adalah file download
    res.attachment(zipFileName);

    const archive = archiver('zip', {
        zlib: { level: 9 } // Level kompresi (opsional)
    });

    // Tangani error saat proses pembuatan arsip
    archive.on('error', (err) => {
        throw err;
    });

    // Pipe (salurkan) output arsip ke response HTTP
    // Ini sangat efisien karena tidak menyimpan file zip di server
    archive.pipe(res);

    // Tambahkan folder 'src' ke dalam arsip
    // Argumen kedua (false) berarti isi dari 'src' akan ada di root zip,
    // bukan di dalam folder 'src' di dalam zip.
    archive.directory(sourceDir, false);

    // Selesaikan proses pengarsipan dan kirim
    archive.finalize();
};

// ▼▼▼ FUNGSI BARU DITAMBAHKAN DI SINI ▼▼▼
export const handleDownloadFile = (req: Request, res: Response) => {
    const { uniqueName } = req.params;
    const storageDir = path.join(rootPath, 'storage', 'RSpace_data');
    const metadataPath = path.join(storageDir, 'metadata.json');

    try {
        // 1. Baca metadata.json
        if (!fs.existsSync(metadataPath)) {
            return res.status(404).json({ message: 'File metadata tidak ditemukan.' });
        }
        const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);

        // 2. Dapatkan nama file asli
        const originalName = metadata[uniqueName];
        if (!originalName) {
            return res.status(404).json({ message: 'File tidak ditemukan di dalam metadata.' });
        }

        // 3. Cek keberadaan file fisik
        const filePath = path.join(storageDir, uniqueName);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File fisik tidak ditemukan di server.' });
        }

        // 4. Kirim file untuk diunduh
        // res.download() akan mengatur header Content-Disposition secara otomatis
        res.download(filePath, originalName, (err) => {
            if (err) {
                console.error("Error saat mengirim file:", err);
                // Header mungkin sudah terkirim sebagian, jadi tidak bisa kirim res.status() lagi
            }
        });

    } catch (error) {
        console.error('Gagal memproses unduhan file:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};