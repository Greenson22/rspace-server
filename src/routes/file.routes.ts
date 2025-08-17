// src/routes/file.routes.ts

import { Router } from 'express';
import { deleteFile, getFileList } from '../controllers/file.controller';

const router = Router();

// Endpoint untuk mendapatkan daftar file dari metadata
router.get('/files', getFileList);
// Endpoint untuk menghapus file berdasarkan nama uniknya
router.delete('/files/:uniqueName', deleteFile);

export default router;