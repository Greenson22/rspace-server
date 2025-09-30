// src/index.ts

import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MulterError } from 'multer';
import path from 'path'; // Import modul 'path'
import { rootPath } from './config/path'; // Import 'rootPath'

// Impor Database Service (agar inisialisasi berjalan)
import './services/database.service'; 

// Rute
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes'; // Impor rute user baru
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
// == ENDPOINT UNTUK MENYAJIKAN HALAMAN STATIS ==
// ==========================================================
// Middleware sederhana untuk memeriksa token sebelum menyajikan halaman yang dilindungi
// Di aplikasi nyata, ini bisa lebih kompleks, tapi untuk ini, JS di klien akan menangani redirect
const pageAuth = (req: Request, res: Response, next: NextFunction) => {
    // Untuk saat ini, kita biarkan JavaScript di sisi klien yang menangani redirect jika token tidak ada.
    next();
};

// Menyajikan halaman login di root
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(rootPath, 'src', 'views', 'login.html'));
});

// Menyajikan halaman registrasi
app.get('/register', (req: Request, res: Response) => {
    res.sendFile(path.join(rootPath, 'src', 'views', 'register.html'));
});

// Halaman-halaman baru yang dilindungi dan disajikan setelah login
app.get('/dashboard', pageAuth, (req: Request, res: Response) => {
    res.sendFile(path.join(rootPath, 'src', 'views', 'dashboard.html'));
});

app.get('/profile', pageAuth, (req: Request, res: Response) => {
    res.sendFile(path.join(rootPath, 'src', 'views', 'profile.html'));
});

app.get('/users', pageAuth, (req: Request, res: Response) => {
    res.sendFile(path.join(rootPath, 'src', 'views', 'users.html'));
});

app.get('/archive', (req, res) => {
    res.sendFile(path.join(rootPath, 'src', 'views', 'archive.html'));
});
// ==========================================================


// Rute API
// Rute autentikasi tidak memerlukan token
app.use('/api', authRoutes);

// Terapkan middleware jwtAuth untuk semua rute API di bawah ini
app.use('/api', jwtAuth);

// Gunakan rute-rute API yang dilindungi
app.use('/api', userRoutes); // API untuk data pengguna
app.use('/api/rspace', rspaceUploadRoutes);
app.use('/api/rspace', rspaceDownloadRoutes);
app.use('/api/rspace', rspaceFileRoutes);
app.use('/api/perpusku', perpuskuUploadRoutes);
app.use('/api/perpusku', perpuskuDownloadRoutes);
app.use('/api/perpusku', perpuskuFileRoutes);
app.use('/api/discussion', finishedDiscussionUploadRoutes);
app.use('/api/discussion', finishedDiscussionFileRoutes);
app.use('/api/archive', archiveRoutes);


// Penanganan Error Global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    // Penanganan error spesifik dari service auth
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