// src/routes/discussion_upload.routes.ts

import { Router } from 'express';
import { upload } from '../middleware/discussion_upload.middleware';
import { handleUpload } from '../controllers/discussion_upload.controller';

const router = Router();

// Endpoint baru untuk upload file diskusi
// Key 'zipfile' harus sesuai dengan nama field di form-data
router.post('/upload-discussion', upload.single('zipfile'), handleUpload);

export default router;