import { Router } from 'express';
import { deleteFile, getFileList, getFileDetail } from '../controllers/perpusku_file.controller';

const router = Router();

router.get('/files', getFileList);
router.get('/files/:uniqueName', getFileDetail);
router.delete('/files/:uniqueName', deleteFile);

export default router;