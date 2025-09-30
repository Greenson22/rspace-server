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

// Rute
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

const app = express();
const PORT = 3000;

// Middleware global
app.use(cors());
app.use(express.json());


// ==========================================================
// == ENDPOINT UNTUK MENYAJIKAN HALAMAN DAN ASET STATIS ==
// ==========================================================
// Halaman Utama
app.get('/', (req, res) => res.sendFile(path.join(rootPath, 'src', 'views', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(rootPath, 'src', 'views', 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(rootPath, 'src', 'views', 'dashboard.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(rootPath, 'src', 'views', 'profile.html')));
app.get('/users', (req, res) => res.sendFile(path.join(rootPath, 'src', 'views', 'users.html')));
app.get('/archive', (req, res) => res.sendFile(path.join(rootPath, 'src', 'views', 'archive.html')));
app.get('/backups', (req, res) => res.sendFile(path.join(rootPath, 'src', 'views', 'backups.html')));

// Aset Parsial (Navbar, dll)
app.get('/partials/navbar.html', (req, res) => {
    res.sendFile(path.join(rootPath, 'src', 'views', 'partials', 'navbar.html'));
});

// Aset JavaScript
app.get('/js/main.js', (req, res) => {
    res.sendFile(path.join(rootPath, 'src', 'views', 'js', 'main.js'));
});
// ==========================================================

// Rute API
app.use('/api', authRoutes);
app.use('/api', jwtAuth, userRoutes);
app.use('/api', jwtAuth, backupRoutes);
app.use('/api', jwtAuth); // Terapkan middleware jwtAuth untuk sisa rute di bawah

app.use('/api/rspace', rspaceUploadRoutes);
app.use('/api/rspace', rspaceDownloadRoutes);
app.use('/api/rspace', rspaceFileRoutes);
app.use('/api/perpusku', perpuskuUploadRoutes);
app.use('/api/perpusku', perpuskuDownloadRoutes);
app.use('/api/perpusku', perpuskuFileRoutes);
app.use('/api/discussion', finishedDiscussionUploadRoutes);
app.use('/api/discussion', finishedDiscussionFileRoutes);
app.use('/api/archive', archiveRoutes);

// ... (Penanganan Error Global dan app.listen tidak berubah) ...
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