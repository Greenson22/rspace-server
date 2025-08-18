import { Router } from 'express';
import { upload } from '../middleware/perpusku_upload.middleware';
import { handleUpload } from '../controllers/perpusku_upload.controller';

const router = Router();

router.post('/upload', upload.single('zipfile'), handleUpload);

export default router;