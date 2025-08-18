import { Router } from 'express';
import { handleDownloadFile } from '../controllers/perpusku_download.controller';

const router = Router();

router.get('/download/:uniqueName', handleDownloadFile);

export default router;