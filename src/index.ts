// src/index.ts

import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MulterError } from 'multer';
import path from 'path';
import { rootPath } from './config/path';

// Impor Database Service
import './services/database.service'; 

// Rute API
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import backupRoutes from './routes/backup.routes';
import rspaceUploadRoutes from './routes/rspace_upload.routes';
import { publicRspaceDownloadRoutes, privateRspaceDownloadRoutes } from './routes/rspace_download.routes';
import rspaceFileRoutes from './routes/rspace_file.routes';
import perpuskuUploadRoutes from './routes/perpusku_upload.routes';
import perpuskuDownloadRoutes from './routes/perpusku_download.routes';
import perpuskuFileRoutes from './routes/perpusku_file.routes';
import finishedDiscussionUploadRoutes from './routes/discussion_upload.routes';
import finishedDiscussionFileRoutes from './routes/discussion_file.routes';
import archiveRoutes from './routes/archive.routes';
import adminRoutes from './routes/admin.routes';

// Middleware
import { jwtAuth } from './middleware/jwt.middleware';
import { adminAuth } from './middleware/admin.middleware';

// Gunakan port yang berbeda dari client, misalnya 3001
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Sajikan folder /storage secara statis
app.use('/storage', express.static(path.join(rootPath, 'storage')));

// Rute API Publik (tanpa autentikasi)
app.use('/api', authRoutes);
app.use('/api/rspace', publicRspaceDownloadRoutes);

// Rute-rute di bawah ini memerlukan autentikasi JWT
app.use('/api', jwtAuth, userRoutes);
app.use('/api', jwtAuth, backupRoutes);
app.use('/api/rspace', jwtAuth, rspaceUploadRoutes, privateRspaceDownloadRoutes, rspaceFileRoutes);
app.use('/api/perpusku', jwtAuth, perpuskuUploadRoutes, perpuskuDownloadRoutes, perpuskuFileRoutes);
app.use('/api/discussion', jwtAuth, finishedDiscussionUploadRoutes, finishedDiscussionFileRoutes);
app.use('/api/archive', jwtAuth, archiveRoutes);

// Rute khusus Admin
app.use('/api/admin', jwtAuth, adminAuth, adminRoutes);


// Penanganan Error Global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    // ==> PERUBAHAN DI SINI <==
    if (
        err.message === 'Email sudah terdaftar.' || 
        err.message === 'Username sudah digunakan.' ||
        err.message === 'Email atau password salah.' ||
        err.message === 'Username/Email atau password salah.' ||
        err.message === 'Akun Anda belum diverifikasi. Silakan periksa email Anda.' ||
        err.message === 'Akun Anda belum diverifikasi. Silakan periksa email Anda, atau tunggu verifikasi manual dari Admin.'
    ) {
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