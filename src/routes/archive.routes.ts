// src/routes/archive.routes.ts

import { Router } from 'express';
import { upload } from '../middleware/archive_upload.middleware';
import { handleArchiveUpload } from '../controllers/archive.controller';

const router = Router();

// Endpoint untuk mengunggah arsip diskusi yang telah selesai
// Key 'zipfile' harus sesuai dengan yang dikirim dari Flutter
router.post('/discussions', upload.single('zipfile'), handleArchiveUpload);

export default router;