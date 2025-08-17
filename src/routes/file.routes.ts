// src/routes/file.routes.ts

import { Router } from 'express';
import { getFileList } from '../controllers/file.controller';

const router = Router();

// Endpoint untuk mendapatkan daftar file dari metadata
router.get('/files', getFileList);

export default router;