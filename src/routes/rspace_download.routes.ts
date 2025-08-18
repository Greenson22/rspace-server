import { Router } from 'express';
import { handleDownloadSrc, handleDownloadFile } from '../controllers/rspace_download.controller';

const router = Router();

// Endpoint untuk men-trigger download folder src sebagai zip
router.get('/download-src', handleDownloadSrc);
router.get('/download/:uniqueName', handleDownloadFile);

export default router;