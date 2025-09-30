// src/routes/archive.routes.ts

import { Router } from 'express';
import { upload } from '../middleware/archive_upload.middleware';
import { 
    handleArchiveUpload,
    getArchivedTopics,
    getArchivedSubjects,
    getArchivedDiscussions,
    downloadArchivedFile
} from '../controllers/archive.controller';

const router = Router();

// Endpoint untuk mengunggah arsip
router.post('/discussions', upload.single('zipfile'), handleArchiveUpload);

// Endpoint untuk mengambil data arsip
router.get('/topics', getArchivedTopics);
router.get('/topics/:topicName/subjects', getArchivedSubjects);
router.get('/topics/:topicName/subjects/:subjectName/discussions', getArchivedDiscussions);

// Endpoint untuk mengunduh satu file HTML dari dalam arsip
// e.g., /api/archive/file?path=NamaTopik/NamaSubjek/namafile.html
router.get('/file', downloadArchivedFile);

export default router;