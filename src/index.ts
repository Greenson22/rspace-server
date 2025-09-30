// src/index.ts

import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MulterError } from 'multer';
import path from 'path'; // <-- Import modul 'path'
import { rootPath } from './config/path'; // <-- Import 'rootPath'

// Impor Database Service
import './services/database.service'; 

// Rute
import authRoutes from './routes/auth.routes';
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
// == PERUBAHAN DI SINI: SAJIKAN FILE HTML DARI FOLDER 'views' ==
// ==========================================================
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(rootPath, 'src', 'views', 'login.html'));
});

app.get('/register', (req: Request, res: Response) => {
    res.sendFile(path.join(rootPath, 'src', 'views', 'register.html'));
});
// ==========================================================


// Gunakan Rute Autentikasi (tanpa middleware keamanan)
app.use('/api', authRoutes);

// Terapkan Middleware Keamanan JWT untuk semua rute di bawah ini
app.use('/api', jwtAuth);

// ... (sisa kode tidak berubah) ...
app.use('/api/rspace', rspaceUploadRoutes);
app.use('/api/rspace', rspaceDownloadRoutes);
app.use('/api/rspace', rspaceFileRoutes);
app.use('/api/perpusku', perpuskuUploadRoutes);
app.use('/api/perpusku', perpuskuDownloadRoutes);
app.use('/api/perpusku', perpuskuFileRoutes);
app.use('/api/discussion', finishedDiscussionUploadRoutes);
app.use('/api/discussion', finishedDiscussionFileRoutes);
app.use('/api/archive', archiveRoutes);

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