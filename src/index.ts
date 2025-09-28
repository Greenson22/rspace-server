// src/index.ts

import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MulterError } from 'multer';

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

// Archive Routes (TAMBAHKAN INI)
import archiveRoutes from './routes/archive.routes';

import { apiKeyAuth } from './middleware/auth.middleware';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Terapkan Middleware Keamanan
app.use('/api', apiKeyAuth);

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

// Gunakan Rute Archive (TAMBAHKAN INI)
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