// src/routes/file.routes.ts

import { Router } from 'express';
import { deleteFile, getFileList, getFileDetail } from '../controllers/rspace_file.controller';

const router = Router();

// Endpoint untuk mendapatkan daftar file dari metadata
router.get('/files', getFileList);
// Endpoint untuk mendapatkan detail satu file
router.get('/files/:uniqueName', getFileDetail);
// Endpoint untuk menghapus file berdasarkan nama uniknya
router.delete('/files/:uniqueName', deleteFile);

export default router;