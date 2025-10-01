// src/index.ts

import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import next from 'next'; // 1. Import Next.js
import cors from 'cors';
import { MulterError } from 'multer';
import path from 'path';
import { rootPath } from './config/path';

// Impor Database Service
import './services/database.service'; 

// Rute API (tetap sama)
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import backupRoutes from './routes/backup.routes';
import rspaceUploadRoutes from './routes/rspace_upload.routes';
import rspaceDownloadRoutes from './routes/rspace_download.routes';
import rspaceFileRoutes from './routes/rspace_file.routes';
import perpuskuUploadRoutes from './routes/perpusku_upload.routes';
import perpuskuDownloadRoutes from './routes/perpusku_download.routes';
import perpuskuFileRoutes from './routes/perpusku_file.routes';
import finishedDiscussionUploadRoutes from './routes/discussion_upload.routes';
import finishedDiscussionFileRoutes from './routes/discussion_file.routes';
import archiveRoutes from './routes/archive.routes';

// Middleware
import { jwtAuth } from './middleware/jwt.middleware';

// 2. Tentukan mode dev/prod dan inisialisasi aplikasi Next.js
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: './client' }); // Arahkan ke folder 'client'
const handle = nextApp.getRequestHandler();

const PORT = process.env.PORT || 3000;

// 3. Gunakan .then() karena nextApp.prepare() adalah async
nextApp.prepare().then(() => {
    const app = express();

    // Middleware global
    app.use(cors());
    app.use(express.json());

    // Sajikan folder /storage secara statis (tetap diperlukan)
    app.use('/storage', express.static(path.join(rootPath, 'storage')));

    // Rute API (semua rute API Anda tetap di sini)
    app.use('/api', authRoutes);
    app.use('/api', jwtAuth, userRoutes);
    app.use('/api', jwtAuth, backupRoutes);
    
    // Kelompokkan rute API di bawah satu middleware jwtAuth untuk efisiensi
    app.use('/api/rspace', jwtAuth, rspaceUploadRoutes, rspaceDownloadRoutes, rspaceFileRoutes);
    app.use('/api/perpusku', jwtAuth, perpuskuUploadRoutes, perpuskuDownloadRoutes, perpuskuFileRoutes);
    app.use('/api/discussion', jwtAuth, finishedDiscussionUploadRoutes, finishedDiscussionFileRoutes);
    app.use('/api/archive', jwtAuth, archiveRoutes);

    // 4. Hapus semua app.get() untuk file HTML statis lama

    // 5. Serahkan semua request lainnya (non-API) ke Next.js
    app.all('*', (req: Request, res: Response) => {
        return handle(req, res);
    });

    // Penanganan Error Global (tetap sama)
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err);

        if (err.message === 'Email sudah terdaftar.' || err.message === 'Email atau password salah.') {
            return res.status(400).json({ type: 'AuthError', message: err.message });
        }

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
});