import { Router } from 'express';
import { getList, createFolder, deleteItem, downloadItem, handleUpload } from '../controllers/sharing.controller';
import { uploadSharing } from '../middleware/sharing_upload.middleware';

const router = Router();

// GET: List isi folder (query param: ?path=...)
router.get('/list', getList);

// POST: Buat folder baru (body: { parentPath, folderName })
router.post('/folder', createFolder);

// POST: Upload file (query param: ?path=...)
// Menggunakan 'file' sebagai key form-data
router.post('/upload', uploadSharing.single('file'), handleUpload);

// DELETE: Hapus file/folder (query param: ?path=...)
router.delete('/delete', deleteItem);

// GET: Download file (query param: ?path=...)
router.get('/download', downloadItem);

export default router;