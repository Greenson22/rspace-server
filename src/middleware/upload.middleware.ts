import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { rootPath } from '../config/path';
import { v4 as uuidv4 } from 'uuid';

// Tentukan dan buat folder penyimpanan jika belum ada
const uploadDir = path.join(rootPath, 'storage', 'RSpace_data');
fs.mkdirSync(uploadDir, { recursive: true });

// Tentukan path untuk file metadata
const metadataPath = path.join(uploadDir, 'metadata.json');

// Interface untuk struktur metadata
interface FileMetadata {
    uniqueName: string;
    originalName: string;
    createdAt: number; // Timestamp dalam milidetik
}

// Fungsi untuk memperbarui metadata
const updateMetadata = (uniqueName: string, originalName: string) => {
    try {
        let metadata: FileMetadata[] = [];
        // Baca file metadata jika sudah ada
        if (fs.existsSync(metadataPath)) {
            const fileContent = fs.readFileSync(metadataPath, 'utf-8');
            metadata = fileContent ? JSON.parse(fileContent) : [];
        }

        // Hapus file terlama jika sudah ada 5 file atau lebih
        if (metadata.length >= 5) {
            // Urutkan berdasarkan waktu pembuatan (yang paling lama di awal)
            metadata.sort((a, b) => a.createdAt - b.createdAt);
            const oldestFile = metadata.shift(); // Ambil dan hapus elemen pertama

            if (oldestFile) {
                // Saat menghapus, tambahkan kembali ekstensi .zip untuk menemukan file fisik
                const filePath = path.join(uploadDir, `${oldestFile.uniqueName}.zip`);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // Hapus file fisik
                    console.log(`File terlama dihapus: ${oldestFile.originalName}`);
                }
            }
        }

        // Tambahkan entri baru dengan timestamp
        metadata.push({
            uniqueName,
            originalName,
            createdAt: Date.now(),
        });

        // Tulis kembali ke file
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    } catch (error) {
        console.error('Gagal memperbarui metadata.json:', error);
        // Jika metadata krusial, Anda bisa melempar error di sini
    }
};


// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Hanya izinkan file .zip
        if (!file.originalname.match(/\.zip$/)) {
            return cb(new Error('Hanya file .zip yang diizinkan!'), '');
        }

        // Buat nama unik tanpa ekstensi
        const uniqueIdentifier = uuidv4(); 
        
        // Nama file fisik tetap menggunakan ekstensi
        const newFilename = `${uniqueIdentifier}${path.extname(file.originalname)}`;
        
        // Panggil fungsi untuk memperbarui metadata HANYA dengan nama unik (tanpa ekstensi)
        updateMetadata(uniqueIdentifier, file.originalname);

        cb(null, newFilename);
    }
});

// Buat instance multer middleware
export const upload = multer({ storage: storage });