// src/routes/archive.routes.ts

import { Router } from 'express';
import { upload } from '../middleware/archive_upload.middleware';
import { 
    handleArchiveUpload,
    getArchivedTopics,
    getArchivedSubjects,
    getArchivedDiscussions
} from '../controllers/archive.controller';

const router = Router();

// Endpoint untuk mengunggah arsip
router.post('/discussions', upload.single('zipfile'), handleArchiveUpload);

// --- ENDPOINT BARU UNTUK MENGAMBIL DATA ARSIP ---

// Mendapatkan daftar semua topik dalam arsip
router.get('/topics', getArchivedTopics);

// Mendapatkan daftar subjek dalam satu topik
router.get('/topics/:topicName/subjects', getArchivedSubjects);

// Mendapatkan daftar diskusi dalam satu subjek
router.get('/topics/:topicName/subjects/:subjectName/discussions', getArchivedDiscussions);


export default router;