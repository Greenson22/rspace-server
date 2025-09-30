// src/index.ts

import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MulterError } from 'multer';

// ... (sisa import-import tidak berubah) ...
// RSpace Routes
import rspaceUploadRoutes from './routes/rspace_upload.routes';
import rspaceDownloadRoutes from './routes/rspace_download.routes';
import rspaceFileRoutes from './routes/rspace_file.routes';

// PerpusKu Routes
import perpuskuUploadRoutes from './routes/perpusku_upload.routes';
import perpuskuDownloadRoutes from './routes/perpusku_download.routes';
import perpuskuFileRoutes from './routes/perpusku_file.routes';

// Discussion Routes (diganti namanya agar lebih jelas)
import finishedDiscussionUploadRoutes from './routes/discussion_upload.routes';
import finishedDiscussionFileRoutes from './routes/discussion_file.routes';

// Archive Routes
import archiveRoutes from './routes/archive.routes';

import { apiKeyAuth } from './middleware/auth.middleware';


const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());


// ==========================================================
// == AWAL DARI KODE YANG DIPERBARUI UNTUK ENDPOINT ROOT ==
// ==========================================================
app.get('/', (req: Request, res: Response) => {
    const now = new Date();
    const timeString = now.toLocaleString('id-ID', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    res.status(200).send(`
        <html lang="id">
            <head>
                <title>RSpace Server</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; background-color: #f4f7f9; color: #333; }
                    .header { background: linear-gradient(90deg, #2c3e50, #3498db); color: white; padding: 40px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 2.5em; }
                    .container { max-width: 800px; margin: 40px auto; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                    h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                    p, li { line-height: 1.6; }
                    ul { padding-left: 20px; }
                    .status { display: inline-block; padding: 5px 10px; background-color: #27ae60; color: white; font-weight: bold; border-radius: 5px; }
                    .footer { text-align: center; margin-top: 40px; color: #7f8c8d; }
                    a { color: #3498db; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🚀 RSpace Server</h1>
                    <p>Layanan Backend untuk Aplikasi RSpace</p>
                </div>

                <div class="container">
                    <h2>Tentang Aplikasi RSpace</h2>
                    <p>
                        <b>RSpace</b> adalah sebuah aplikasi Android yang dirancang sebagai alat bantu belajar personal dan manajemen pengetahuan. Aplikasi ini memungkinkan pengguna untuk mengatur materi belajar, melacak tugas, mencatat aktivitas harian, dan menguji pemahaman melalui kuis, dengan dukungan fitur AI dari Gemini.
                    </p>
                    
                    <h2>Fungsi Server Ini</h2>
                    <p>
                        Server ini bertindak sebagai jembatan untuk fitur-fitur online dari aplikasi RSpace. Fungsi utamanya adalah:
                    </p>
                    <ul>
                        <li>Menyediakan tempat penyimpanan online untuk file backup data RSpace dan PerpusKu.</li>
                        <li>Mengelola dan menyatukan data arsip dari diskusi yang telah selesai.</li>
                        <li>Memfasilitasi proses download dan sinkronisasi data kembali ke perangkat pengguna.</li>
                    </ul>
                    <p>Semua endpoint API yang memerlukan otorisasi diamankan menggunakan API Key.</p>

                    <h2>Status Server</h2>
                    <p>
                        Status: <span class="status">Normal</span><br>
                        Waktu Server (WITA): <b>${timeString}</b>
                    </p>

                    <h2>Tautan Unduhan</h2>
                    <ul>
                        <li><a href="/api/rspace/download-src">Unduh Kode Sumber Server (.zip)</a></li>
                        <li><a href="https://github.com/FrendyRikal/RSpace/releases">Unduh Aplikasi Android (APK)</a></li>
                    </ul>
                </div>

                <div class="footer">
                    <p>&copy; ${now.getFullYear()} Frendy Rikal Gerung</p>
                </div>
            </body>
        </html>
    `);
});
// ==========================================================
// == AKHIR DARI KODE YANG DIPERBARUI ==
// ==========================================================


// Terapkan Middleware Keamanan
app.use('/api', apiKeyAuth);

// ... (sisa kode tidak berubah) ...
// Gunakan Rute RSpace
app.use('/api/rspace', rspaceUploadRoutes);
app.use('/api/rspace', rspaceDownloadRoutes);
app.use('/api/rspace', rspaceFileRoutes);

// Gunakan Rute PerpusKu
app.use('/api/perpusku', perpuskuUploadRoutes);
app.use('/api/perpusku', perpuskuDownloadRoutes);
app.use('/api/perpusku', perpuskuFileRoutes);

// Gunakan Rute Discussion (nama lama, bisa dihapus jika tidak dipakai lagi)
app.use('/api/discussion', finishedDiscussionUploadRoutes);
app.use('/api/discussion', finishedDiscussionFileRoutes);

// Gunakan Rute Archive
app.use('/api/archive', archiveRoutes);


// Penanganan Error Global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (err instanceof MulterError) {
        return res.status(400).json({
            type: 'UploadError',
            message: `Terjadi error saat unggah file: ${err.message}`,
            field: err.field,
        });
    }

    const isDevelopment = process.env.NODE_ENV === 'development';
    return res.status(500).json({
        type: 'ServerError',
        message: 'Terjadi kesalahan pada server.',
        error: isDevelopment ? { message: err.message, stack: err.stack } : undefined,
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});