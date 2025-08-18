// src/index.ts

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MulterError } from 'multer'; // Impor MulterError
import uploadRoutes from './routes/rspace_upload.routes';
import downloadRoutes from './routes/rspace_download.routes';
import fileRoutes from './routes/rspace_file.routes';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Gunakan Rute
app.use('/api', uploadRoutes);
app.use('/api', downloadRoutes);
app.use('/api', fileRoutes);

// Penanganan Error Global yang Ditingkatkan
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err); // Selalu log error untuk debugging

    // Tangani error spesifik dari Multer
    if (err instanceof MulterError) {
        return res.status(400).json({
            type: 'UploadError',
            message: `Terjadi error saat unggah file: ${err.message}`,
            field: err.field, // Menunjukkan field mana yang bermasalah
        });
    }

    // Tangani error umum
    // Di lingkungan produksi, Anda mungkin ingin menyembunyikan `err.stack`
    const isDevelopment = process.env.NODE_ENV === 'development';
    return res.status(500).json({
        type: 'ServerError',
        message: 'Terjadi kesalahan pada server.',
        // Hanya kirim detail error jika dalam mode development
        error: isDevelopment ? { message: err.message, stack: err.stack } : undefined,
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});