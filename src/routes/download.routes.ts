import { Router } from 'express';
import { handleDownloadSrc } from '../controllers/download.controller';

const router = Router();

// Endpoint untuk men-trigger download folder src sebagai zip
router.get('/download-src', handleDownloadSrc);

export default router;