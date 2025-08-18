import { Router } from 'express';
import { upload } from '../middleware/rspace_upload.middleware'; // Impor middleware
import { handleUpload } from '../controllers/rspace_upload.controller'; // Impor controller

const router = Router();

// Terapkan middleware 'upload.single' sebelum memanggil controller 'handleUpload'
// Key 'zipfile' harus sesuai dengan nama field di form-data
router.post('/upload', upload.single('zipfile'), handleUpload);

export default router;