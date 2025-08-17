import { Router } from 'express';
import { upload } from '../middleware/upload.middleware'; // Impor middleware
import { handleUpload } from '../controllers/upload.controller'; // Impor controller

const router = Router();

// Terapkan middleware 'upload.single' sebelum memanggil controller 'handleUpload'
// Key 'zipfile' harus sesuai dengan nama field di form-data
router.post('/upload', upload.single('zipfile'), handleUpload);

export default router;